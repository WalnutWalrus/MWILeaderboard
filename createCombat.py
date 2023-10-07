import json


def calculate_combat_hourly_xp():
    # Define the combat skills
    COMBAT_SKILLS = ["Stamina", "Intelligence", "Attack", "Power", "Defense", "Ranged", "Magic"]

    # Load the data
    with open("Outputs/output_compete.json", "r") as f:
        data = json.load(f)

    # Calculate the total hourly XP for combat skills for each player
    for player in data['playerData']:
        total_combat_hourly_xp = sum(player.get(f"{skill}HourlyXP", 0) for skill in COMBAT_SKILLS)
        player["CombatHourlyXP"] = total_combat_hourly_xp

    # Save the updated data into a new JSON file
    with open("Outputs/output_combat.json", "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    calculate_combat_hourly_xp()
