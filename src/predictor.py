import pandas as pd
from matplotlib import pyplot as plt

data = pd.read_csv(
    'D://Programas//VSCode//Projetos//WeatherForecast//src//data//weatherForecast.csv', encoding="ISO-8859-1", on_bad_lines='skip')

print(data.head())
print(data.describe())

# print(data.dtypes)
data['Date'] = pd.to_datetime(data['Date'])

plt.plot(data['Temperature (Â°C)'], data['Date'])
plt.show()
