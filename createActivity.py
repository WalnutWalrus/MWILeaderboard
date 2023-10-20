import json
from config import HOURLY_SKILL_NAMES


def calculate_activity():
    with open("Outputs/output_combat.json", "r") as f:
        data = json.load(f)

    skillData = {}
    for skill in HOURLY_SKILL_NAMES:
        skillData[skill + "Active"] = 0
        skillData[skill + "New"] = 0  # Initialize counter for new players for each skill

    for player in data["playerData"]:
        for skill in HOURLY_SKILL_NAMES:
            skill_key = 'TotalLevelHourlyXP' if skill == 'Total Level' else skill + "HourlyXP"

            # Special case for 'Task Points'
            if skill == 'Task Points':
                if "TaskPointsEarned" in player and player["TaskPointsEarned"] > 0:
                    skillData[skill + "Active"] += 1
            else:
                if skill_key in player and player[skill_key] > 0:
                    skillData[skill + "Active"] += 1

            # Check for new players or players who have dropped off the leaderboard
            if skill == 'Total Level':
                starting_key = 'TotalLevelStartingXP'
                ending_key = 'TotalLevelEndingXP'
            elif skill == 'Task Points':
                starting_key = 'TaskPointsStartingLevel'
                ending_key = 'TaskPointsEndingLevel'
            else:
                starting_key = skill + "StartingXP"
                ending_key = skill + "EndingXP"

            # if player[starting_key] is not None and player[ending_key] is None:
            #     skillData[skill + "New"] += 1
            # elif
            # Should show new players only, above was doubling up
            if player[starting_key] is None and player[ending_key] is not None:
                skillData[skill + "New"] += 1

    # Add skillData to the json data
    data["skillData"] = skillData

    with open("Outputs/output_skills.json", "w") as f:
        json.dump(data, f, indent=4)

