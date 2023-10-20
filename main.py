import createCompare
import createHourly
import createPredict
import createGuild
import createCompete
import createCombat
import createActivity
import shutil

if __name__ == "__main__":
    createCompare.generate_and_save_output()
    createHourly.calculate_hourly_xp()
    createHourly.calculate_total_greater_than_hourly()
    createPredict.calculate_predict()
    createGuild.calculate_next_guild_slot()
    createCompete.calculate_overtake()
    createCombat.calculate_combat_hourly_xp()
    createCombat.calculate_melee_hourly_xp()
    createCombat.calculate_melee_normalised()
    createActivity.calculate_activity()

    # Copy the final output to prep for HTML
    shutil.copy("Outputs/output_skills.json", "docs/output.json")
