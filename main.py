import createCompare
import createHourly
import createPredict

if __name__ == "__main__":
    createCompare.generate_and_save_output()
    createHourly.calculate_hourly_xp()
    createPredict.calculate_predict()
