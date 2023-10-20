import json
from config import HOURLY_SKILL_NAMES


def calculate_activity():
    with open("Outputs/output_combat.json", "r") as f:
        data = json.load(f)
    player_data = data['playerData']

    skillData = {}
    for skill in HOURLY_SKILL_NAMES:
        skillData[skill + "Active"] = 0

    for player in data["playerData"]:
        for skill in HOURLY_SKILL_NAMES:
            skill_key = 'TotalLevelHourlyXP' if skill == 'Total Level' else skill + "HourlyXP"
            # Check if the key exists and if the hourlyXP is greater than zero

            # Special case for 'Task Points'
            if skill == 'Task Points':
                if "TaskPointsEarned" in player and player["TaskPointsEarned"] > 0:
                    skillData[skill + "Active"] += 1
            # For other skills
            else:
                if skill_key in player and player[skill_key] > 0:
                    # Increase the count for that skill
                    skillData[skill + "Active"] += 1

    # Add skillData to the json data
    data["skillData"] = skillData

    with open("Outputs/output_skills.json", "w") as f:
        json.dump(data, f, indent=4)
