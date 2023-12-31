import json
from datetime import datetime, timedelta
from config import SKILL_NAMES


def calculate_overtake():
    with open("Outputs/output_guild.json", "r") as f:
        data = json.load(f)

    # Exclude 'Total Level' and 'Task Points' from calculations
    filtered_skill_names = [skill for skill in SKILL_NAMES if skill not in ["Total Level", "Task Points"]]

    for skill in filtered_skill_names:
        # Sort the players based on ending XP for the skill
        sorted_players = sorted(data['playerData'], key=lambda x: x.get(f"{skill}EndingXP") or -float('inf'), reverse=True)

        for i, player in enumerate(sorted_players[:-1]):
            next_player = sorted_players[i + 1]

            # Determine the XP difference
            xp_diff = (next_player.get(f"{skill}EndingXP") or 0) - (player.get(f"{skill}EndingXP") or 0)

            # Check if next_player will overtake the current player
            xp_rate_diff = (next_player.get(f"{skill}HourlyXP") or 0) - (player.get(f"{skill}HourlyXP") or 0)

            if xp_rate_diff > 0:
                hours_to_overtake = abs(xp_diff) / xp_rate_diff
                overtake_time = datetime.fromisoformat(data['metadata']['endTime']) + timedelta(hours=hours_to_overtake)
                next_player[f"{skill}OvertakeTimestamp"] = overtake_time.isoformat()
            else:
                next_player[f"{skill}OvertakeTimestamp"] = "Not catching up"

        # Top ranked player
        sorted_players[0][f"{skill}OvertakeTimestamp"] = "Already Rank 1"

    with open("Outputs/output_compete.json", "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    calculate_overtake()
