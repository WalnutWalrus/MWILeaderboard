import json
from datetime import datetime, timedelta
from config import SKILL_NAMES


def get_next_xp_threshold(current_xp, xp_thresholds):
    for xp in xp_thresholds.values():
        if xp > current_xp:
            return xp
    return None


def calculate_predict():
    with open("Outputs/output_hourly.json", "r") as f:
        data = json.load(f)

    with open("xp_thresholds.json", "r") as f:
        xp_thresholds = json.load(f)

    end_time = datetime.fromisoformat(data['metadata']['endTime'])

    for player in data["playerData"]:
        for skill in SKILL_NAMES:
            if skill not in ["Total Level", "Task Points"]:
                hourly_xp_key = f"{skill}HourlyXP"
                ending_xp_key = f"{skill}EndingXP"

                # Check if the player has the hourly XP data for the skill
                if hourly_xp_key in player:
                    hourly_xp = player[hourly_xp_key]
                    current_xp = player[ending_xp_key]

                    next_threshold = get_next_xp_threshold(current_xp, xp_thresholds)
                    if next_threshold:
                        if hourly_xp > 0:
                            hours_needed = (next_threshold - current_xp) / hourly_xp
                            level_up_time = end_time + timedelta(hours=hours_needed)
                            player[f"{skill}LevelUp"] = level_up_time.isoformat()
                        else:
                            player[f"{skill}LevelUp"] = "N/A"

    with open("Outputs/output_predict.json", "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    calculate_predict()
