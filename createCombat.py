import json


def calculate_combat_hourly_xp():
    # Define the combat skills
    COMBAT_SKILLS = ["Stamina", "Intelligence", "Attack", "Power", "Defense", "Ranged", "Magic"]
    with open("Outputs/output_compete.json", "r") as f:
        data = json.load(f)
    # Calculate the total hourly XP for combat skills for each player
    for player in data['playerData']:
        total_combat_hourly_xp = sum(player.get(f"{skill}HourlyXP", 0) for skill in COMBAT_SKILLS)
        player["CombatHourlyXP"] = total_combat_hourly_xp
    with open("Outputs/output_combat.json", "w") as f:
        json.dump(data, f, indent=4)


# Combined attack and power hourly xp, for comparisons
def calculate_melee_hourly_xp():
    with open("Outputs/output_combat.json", "r") as f:
        data = json.load(f)

    for player in data['playerData']:
        if "AttackHourlyXP" in player or "PowerHourlyXP" in player:
            player["MeleeHourlyXP"] = player.get("AttackHourlyXP", 0) + player.get("PowerHourlyXP", 0)

    with open("Outputs/output_combat.json", "w") as f:
        json.dump(data, f, indent=4)


def calculate_melee_normalised():
    with open("Outputs/output_combat.json", "r") as f:
        data = json.load(f)

    for player in data['playerData']:
        if "AttackHourlyXP" in player or "PowerHourlyXP" in player:
            player["MeleeHourlyXPNormal"] = round((player.get("AttackHourlyXP", 0) + player.get("PowerHourlyXP", 0)) / 1.5)

    with open("Outputs/output_combat.json", "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    calculate_combat_hourly_xp()
