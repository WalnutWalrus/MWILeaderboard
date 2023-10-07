import json
from datetime import datetime, timedelta


def calculate_next_guild_slot():
    # Load the hourly XP data and the XP thresholds
    with open("Outputs/output_predict.json", "r") as f:
        data = json.load(f)

    with open("xp_thresholds.json", "r") as thresholds_file:
        xp_thresholds = json.load(thresholds_file)

    end_time = datetime.fromisoformat(data['metadata']['endTime'])

    for player in data['playerData']:
        if player.get("IsGuild"):
            current_level = player["GuildEndingLevel"]
            # Calculate the next multiple of 5 level
            next_5_multiple = (current_level // 5 + 1) * 5
            current_xp = player["GuildEndingXP"]
            next_threshold = xp_thresholds[str(next_5_multiple)]

            hourly_xp = player.get("GuildHourlyXP", 0)
            if hourly_xp > 0:
                hours_needed = (next_threshold - current_xp) / hourly_xp
                next_slot_time = end_time + timedelta(hours=hours_needed)
                player["NextGuildSlot"] = next_slot_time.isoformat()
            else:
                player["NextGuildSlot"] = "Never (0 XP/h)"

    # Save the updated data into a new JSON file
    with open("Outputs/output_guild.json", "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    calculate_next_guild_slot()
