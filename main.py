import createCompare
import createHourly
import createPredict
import createGuild
import createCompete

if __name__ == "__main__":
    createCompare.generate_and_save_output()
    createHourly.calculate_hourly_xp()
    createPredict.calculate_predict()
    createGuild.calculate_next_guild_slot()
    createCompete.calculate_overtake()
