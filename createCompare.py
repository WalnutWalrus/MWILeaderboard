import os
import json
from datetime import datetime, timedelta, timezone
from config import SKILL_NAMES


# SKILL_NAMES = [
#     "Milking", "Foraging", "Woodcutting", "Cheesesmithing", "Crafting", "Tailoring", "Cooking", "Brewing", "Enhancing",
#     "Stamina", "Intelligence", "Attack", "Power", "Defense", "Ranged", "Magic", "Guild", "Total Level", "Task Points"
# ]


def get_two_most_recent_files():
    input_folder = 'Inputs'
    files = [f for f in os.listdir(input_folder) if f.endswith('.txt') and f[:-4].isdigit()]
    files.sort(key=lambda date: datetime.strptime(date[:-4], '%d%m%Y%H%M'), reverse=True)
    most_recent_file = os.path.join(input_folder, files[0])
    second_most_recent_file = os.path.join(input_folder, files[1])
    return second_most_recent_file, most_recent_file


def extract_data_from_file(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)

    player_data = {}
    for leaderboard in data["leaderboardList"]:
        title = leaderboard["title"]

        for entry in leaderboard["data"]:
            if entry["name"]:
                player_key = (entry["name"], False)
            else:
                player_key = (entry["guild"], True)

            if player_key not in player_data:
                player_data[player_key] = {}

            player_data[player_key][title] = {
                "XP": entry["value2"],
                "Level": entry["value1"]
            }

    return player_data


def extract_and_round_timestamp_from_filename(filename):
    # Extract the timestamp from the filename
    timestamp_str = filename.split("\\")[-1].split(".")[0]  # This line is changed to account for the directory prefix
    timestamp = datetime.strptime(timestamp_str, '%d%m%Y%H%M')

    # Convert the timestamp from NZST to UTC
    nzst = timezone(timedelta(hours=13))  # NZST is UTC+13, adjust if daylight savings
    # nzst = timezone(timedelta(hours=12))  # NZDT is UTC+12, adjust if daylight savings
    timestamp = timestamp.replace(tzinfo=nzst).astimezone(timezone.utc)

    # Round down to nearest 10 minutes
    minutes = (timestamp.minute // 10) * 10
    timestamp = timestamp.replace(minute=minutes, second=0, microsecond=0)

    return timestamp


def generate_output():
    older_file, most_recent_file = get_two_most_recent_files()

    start_time = extract_and_round_timestamp_from_filename(older_file)
    end_time = extract_and_round_timestamp_from_filename(most_recent_file)
    time_difference_minutes = int((end_time - start_time).total_seconds() / 60)  # Convert timedelta to minutes

    older_data = extract_data_from_file(older_file)
    recent_data = extract_data_from_file(most_recent_file)

    final_output = {
        "metadata": {
            "startTime": start_time.isoformat(),
            "endTime": end_time.isoformat(),
            "timeDifference": time_difference_minutes
        },
        "playerData": []
    }

    for player_key, player_recent_data in recent_data.items():
        if player_key in older_data:
            player_entry = {
                "Name": player_key[0],
                "IsGuild": player_key[1]
            }
            for skill in SKILL_NAMES:
                if skill in player_recent_data and skill in older_data[player_key]:
                    skill_formatted = skill.replace(" ", "")
                    player_entry[f"{skill_formatted}StartingXP"] = older_data[player_key][skill]["XP"]
                    player_entry[f"{skill_formatted}StartingLevel"] = older_data[player_key][skill]["Level"]
                    player_entry[f"{skill_formatted}EndingXP"] = player_recent_data[skill]["XP"]
                    player_entry[f"{skill_formatted}EndingLevel"] = player_recent_data[skill]["Level"]
            final_output["playerData"].append(player_entry)

    return final_output


def generate_and_save_output():
    # Generate the output data
    output_data = generate_output()

    # Save the output data to a JSON file in the Outputs folder
    with open("Outputs/output.json", "w") as f:
        json.dump(output_data, f, indent=4)


if __name__ == "__main__":
    generate_and_save_output()
