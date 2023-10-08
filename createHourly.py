import json
from config import SKILL_NAMES


def calculate_hourly_xp():
    with open("Outputs/output.json", "r") as f:
        data = json.load(f)
    player_data = data['playerData']
    time_difference_hours = data['metadata']['timeDifference'] / 60

    for player in player_data:
        total_hourly_xp = 0
        for skill in SKILL_NAMES:
            # Exclude "Task Points" from hourly XP calculation
            if skill == "Task Points":
                starting_level_key = "TaskPointsStartingLevel"
                ending_level_key = "TaskPointsEndingLevel"

                if starting_level_key in player and ending_level_key in player:
                    task_points_earned = player[ending_level_key] - player[starting_level_key]
                    player["TaskPointsEarned"] = task_points_earned
                continue

            skill_formatted = skill.replace(" ", "")
            starting_xp_key = f"{skill_formatted}StartingXP"
            ending_xp_key = f"{skill_formatted}EndingXP"

            if starting_xp_key in player and ending_xp_key in player:
                xp_difference = player[ending_xp_key] - player[starting_xp_key]
                hourly_xp = round(xp_difference / time_difference_hours)
                player[f"{skill_formatted}HourlyXP"] = hourly_xp

                # Exclude "Total Level" when summing up for the total hourly XP
                if skill != "Total Level":
                    total_hourly_xp += hourly_xp

        player["TotalHourlyXP"] = total_hourly_xp
    with open("Outputs/output_hourly.json", "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    calculate_hourly_xp()
