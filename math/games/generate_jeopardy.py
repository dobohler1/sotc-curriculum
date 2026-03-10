#!/usr/bin/env python3
"""
Generate fresh Math Jeopardy game boards for Science on the Court (SOTC)
at Allen Temple Baptist Church.

Uses the Claude API to generate sports-themed math questions with two tiers:
  - Tier A: Younger kids (grades 1-3)
  - Tier B: Older kids (grades 4-7)

Usage:
  python generate_jeopardy.py                         # auto-versioned output
  python generate_jeopardy.py --output custom.html    # custom output filename
  python generate_jeopardy.py --theme "soccer"        # override sports theme
  python generate_jeopardy.py --dry-run               # print JSON only
"""

import argparse
import glob
import json
import os
import re
import sys

import anthropic


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_FILE = os.path.join(SCRIPT_DIR, "jeopardy_math_game.html")


def build_prompt(theme: str = "sports") -> str:
    """Build the prompt that asks Claude to generate jeopardy questions."""
    return f"""You are a curriculum designer for "Science on the Court," an after-school math program at Allen Temple Baptist Church that serves kids in grades 1 through 7.

Generate a complete set of Math Jeopardy categories and questions. The game board has 5 categories, each with 5 questions at point values 100, 200, 300, 400, and 500. Difficulty scales with point value.

THEME: All questions must be themed around {theme}. Use real or realistic athlete names, team names, and game scenarios that kids would find fun and relatable.

IMPORTANT — TWO-TIER SYSTEM:
Every question has TWO versions:
- tierA (grades 1-3): Simple language, 1-2 sentences. Basic arithmetic. Numbers within 20 for 100-point questions, up to 100 for higher-point questions. Operations: addition, subtraction, simple multiplication, basic division with whole-number results.
- tierB (grades 4-7): Multi-step word problems with longer reading. Can include fractions, decimals, percentages, algebra thinking, order of operations, ratios. Should be genuinely challenging for the point level.

Both tiers for the same question should be thematically related (same sport/scenario) but at different complexity levels.

DIFFICULTY SCALING:
- 100 points: Easy — single-step for both tiers
- 200 points: Medium-easy — one or two steps
- 300 points: Medium — two steps for tier A, multi-step for tier B
- 400 points: Hard — two steps for tier A, complex multi-step for tier B
- 500 points: Hardest — multi-step for tier A, challenging multi-step with fractions/percentages/algebra for tier B

REQUIREMENTS:
- All math must be ACCURATE — double-check every answer
- All content must be age-appropriate and positive
- Category names should be creative, fun, and {theme}-related
- Each category should focus on a different math concept or sport area
- Answers should show the work/steps, not just the final number

Return ONLY valid JSON (no markdown fences, no commentary) in this exact structure:

[
  {{
    "name": "Category Name Here",
    "questions": [
      {{
        "points": 100,
        "tierA": {{
          "q": "Simple question for young kids",
          "a": "Step-by-step answer"
        }},
        "tierB": {{
          "q": "Harder question for older kids",
          "a": "Step-by-step answer"
        }}
      }},
      {{
        "points": 200,
        "tierA": {{ "q": "...", "a": "..." }},
        "tierB": {{ "q": "...", "a": "..." }}
      }},
      {{
        "points": 300,
        "tierA": {{ "q": "...", "a": "..." }},
        "tierB": {{ "q": "...", "a": "..." }}
      }},
      {{
        "points": 400,
        "tierA": {{ "q": "...", "a": "..." }},
        "tierB": {{ "q": "...", "a": "..." }}
      }},
      {{
        "points": 500,
        "tierA": {{ "q": "...", "a": "..." }},
        "tierB": {{ "q": "...", "a": "..." }}
      }}
    ]
  }}
]

Generate exactly 5 categories with 5 questions each (25 questions total, 50 tier variants). Return ONLY the JSON array."""


def validate_categories(data) -> list[str]:
    """Validate the generated categories structure. Returns a list of error messages (empty if valid)."""
    errors = []

    if not isinstance(data, list):
        return [f"Expected a JSON array, got {type(data).__name__}"]

    if len(data) != 5:
        errors.append(f"Expected 5 categories, got {len(data)}")

    expected_points = [100, 200, 300, 400, 500]

    for i, cat in enumerate(data):
        prefix = f"Category {i + 1}"

        if not isinstance(cat, dict):
            errors.append(f"{prefix}: expected object, got {type(cat).__name__}")
            continue

        if "name" not in cat or not isinstance(cat.get("name"), str):
            errors.append(f"{prefix}: missing or invalid 'name'")

        if "questions" not in cat or not isinstance(cat.get("questions"), list):
            errors.append(f"{prefix}: missing or invalid 'questions' array")
            continue

        if len(cat["questions"]) != 5:
            errors.append(f"{prefix} ({cat.get('name', '?')}): expected 5 questions, got {len(cat['questions'])}")

        for j, q in enumerate(cat["questions"]):
            qprefix = f"{prefix} ({cat.get('name', '?')}), Q{j + 1}"

            if not isinstance(q, dict):
                errors.append(f"{qprefix}: expected object")
                continue

            if q.get("points") != expected_points[j]:
                errors.append(f"{qprefix}: expected points={expected_points[j]}, got {q.get('points')}")

            for tier_name in ("tierA", "tierB"):
                tier = q.get(tier_name)
                if not isinstance(tier, dict):
                    errors.append(f"{qprefix}: missing or invalid '{tier_name}'")
                    continue
                if not isinstance(tier.get("q"), str) or not tier["q"].strip():
                    errors.append(f"{qprefix} {tier_name}: missing or empty 'q'")
                if not isinstance(tier.get("a"), str) or not tier["a"].strip():
                    errors.append(f"{qprefix} {tier_name}: missing or empty 'a'")

    return errors


def detect_next_version() -> str:
    """Look at existing jeopardy_math_game*.html files and return the next versioned filename."""
    pattern = os.path.join(SCRIPT_DIR, "jeopardy_math_game*.html")
    existing = glob.glob(pattern)

    version_nums = []
    for f in existing:
        basename = os.path.basename(f)
        match = re.search(r"_v(\d+)\.html$", basename)
        if match:
            version_nums.append(int(match.group(1)))
        elif basename == "jeopardy_math_game.html":
            # The original file counts as v1
            version_nums.append(1)

    next_v = max(version_nums, default=1) + 1
    return f"jeopardy_math_game_v{next_v}.html"


def categories_to_js(data) -> str:
    """Convert the categories list to a JavaScript const declaration string."""
    lines = ["const categories = ["]

    for ci, cat in enumerate(data):
        lines.append("  {")
        # Use json.dumps for the name to handle any special characters
        lines.append(f"    name: {json.dumps(cat['name'])},")
        lines.append("    questions: [")

        for qi, q in enumerate(cat["questions"]):
            lines.append("      {")
            lines.append(f"        points: {q['points']},")

            lines.append("        tierA: {")
            lines.append(f"          q: {json.dumps(q['tierA']['q'])},")
            lines.append(f"          a: {json.dumps(q['tierA']['a'])}")
            lines.append("        },")

            lines.append("        tierB: {")
            lines.append(f"          q: {json.dumps(q['tierB']['q'])},")
            lines.append(f"          a: {json.dumps(q['tierB']['a'])}")
            lines.append("        }")

            comma = "," if qi < len(cat["questions"]) - 1 else ""
            lines.append("      }" + comma)

        lines.append("    ]")
        comma = "," if ci < len(data) - 1 else ""
        lines.append("  }" + comma)

    lines.append("];")
    return "\n".join(lines)


def extract_json_from_response(text: str) -> str:
    """Extract JSON from Claude's response, stripping any markdown fences."""
    # Try to find JSON inside code fences first
    fence_match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if fence_match:
        return fence_match.group(1).strip()
    # Otherwise assume the whole response is JSON
    return text.strip()


def main():
    parser = argparse.ArgumentParser(
        description="Generate a fresh Math Jeopardy board for Science on the Court"
    )
    parser.add_argument(
        "--output", "-o",
        help="Output HTML filename (default: auto-versioned)"
    )
    parser.add_argument(
        "--theme", "-t",
        default="sports",
        help="Theme for questions (default: sports)"
    )
    parser.add_argument(
        "--dry-run", "-n",
        action="store_true",
        help="Print generated questions JSON without creating an HTML file"
    )
    args = parser.parse_args()

    # --- Check for API key ---
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable is not set.")
        print("Set it with: export ANTHROPIC_API_KEY='sk-ant-...'")
        sys.exit(1)

    # --- Read template ---
    if not os.path.exists(TEMPLATE_FILE):
        print(f"ERROR: Template file not found: {TEMPLATE_FILE}")
        sys.exit(1)

    print(f"Reading template from {TEMPLATE_FILE} ...")
    with open(TEMPLATE_FILE, "r", encoding="utf-8") as f:
        template_html = f.read()

    # --- Call Claude API ---
    print(f"Calling Claude API to generate {args.theme}-themed questions ...")
    client = anthropic.Anthropic()

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8000,
            messages=[
                {
                    "role": "user",
                    "content": build_prompt(args.theme),
                }
            ],
        )
    except anthropic.APIError as e:
        print(f"ERROR: Claude API call failed: {e}")
        sys.exit(1)

    raw_response = message.content[0].text
    print(f"Received response ({len(raw_response)} chars). Parsing JSON ...")

    # --- Parse JSON ---
    json_text = extract_json_from_response(raw_response)
    try:
        categories = json.loads(json_text)
    except json.JSONDecodeError as e:
        print(f"ERROR: Failed to parse JSON from Claude's response: {e}")
        print("\n--- Raw response ---")
        print(raw_response)
        sys.exit(1)

    # --- Validate ---
    print("Validating question structure ...")
    errors = validate_categories(categories)
    if errors:
        print("ERROR: Validation failed:")
        for err in errors:
            print(f"  - {err}")
        print("\n--- Raw JSON ---")
        print(json.dumps(categories, indent=2))
        sys.exit(1)

    print("Validation passed: 5 categories, 25 questions, all tiers present.")

    # --- Print summary ---
    for cat in categories:
        print(f"  Category: {cat['name']}")

    # --- Dry run ---
    if args.dry_run:
        print("\n--- Generated Questions (dry run) ---")
        print(json.dumps(categories, indent=2))
        print("\nDry run complete. No HTML file created.")
        return

    # --- Replace categories in template ---
    print("Replacing categories in template ...")

    # Match the const categories = [...]; block
    pattern = re.compile(
        r"const\s+categories\s*=\s*\[.*?\n\];",
        re.DOTALL,
    )

    if not pattern.search(template_html):
        print("ERROR: Could not find 'const categories = [...]' block in template HTML.")
        sys.exit(1)

    new_js = categories_to_js(categories)
    new_html = pattern.sub(new_js, template_html)

    # --- Determine output filename ---
    if args.output:
        output_filename = args.output
        if not os.path.isabs(output_filename):
            output_path = os.path.join(SCRIPT_DIR, output_filename)
        else:
            output_path = output_filename
    else:
        output_filename = detect_next_version()
        output_path = os.path.join(SCRIPT_DIR, output_filename)

    # --- Write output ---
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(new_html)

    print(f"New game board written to: {output_path}")
    print("Done!")


if __name__ == "__main__":
    main()
