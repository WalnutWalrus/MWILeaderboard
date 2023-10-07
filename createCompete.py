import json
from datetime import datetime, timedelta
from config import SKILL_NAMES


def calculate_overtake():
    # Load the data
    with open("Outputs/output_guild.json", "r") as f:
        data = json.load(f)

    # Exclude 'Total Level' and 'Task Points' from calculations
    filtered_skill_names = [skill for skill in SKILL_NAMES if skill not in ["Total Level", "Task Points"]]

    for skill in filtered_skill_names:
        # Sort the players based on ending XP for the skill
        sorted_players = sorted(data['playerData'], key=lambda x: x.get(f"{skill}EndingXP", 0), reverse=True)

        for i, player in enumerate(sorted_players[:-1]):
            next_player = sorted_players[i + 1]

            # Determine the XP difference
            xp_diff = next_player.get(f"{skill}EndingXP", 0) - player.get(f"{skill}EndingXP", 0)

            # Check if current player will overtake the next player
            xp_rate_diff = player.get(f"{skill}HourlyXP", 0) - next_player.get(f"{skill}HourlyXP", 0)

            if xp_rate_diff > 0:
                hours_to_overtake = xp_diff / xp_rate_diff
                overtake_time = datetime.fromisoformat(data['metadata']['endTime']) + timedelta(hours=hours_to_overtake)
                player[f"{skill}OvertakeTimestamp"] = overtake_time.isoformat()
            else:
                player[f"{skill}OvertakeTimestamp"] = "Not catching up"

        # Top ranked player
        sorted_players[0][f"{skill}OvertakeTimestamp"] = "Already Rank 1"

    # Save the updated data into a new JSON file
    with open("Outputs/output_compete.json", "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    calculate_overtake()
