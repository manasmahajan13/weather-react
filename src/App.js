import { TextField, IconButton, Autocomplete, styled } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import moment from "moment";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { ReactComponent as Cloud } from "./assets/cloud.svg";
import { ReactComponent as Mist } from "./assets/mist.svg";
import { ReactComponent as Rain } from "./assets/raindrops-alt.svg";
import { ReactComponent as Snow } from "./assets/snowflake.svg";
import { ReactComponent as Sun } from "./assets/sun.svg";
import { ReactComponent as Thunder } from "./assets/thunderstorm.svg";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

const openWeatherapi = {
  key: "44000accc6533b1bda817f9b5baa2a7b",
};

const timeZoneApi = {
  key: "ZE9T7UYMDERW",
};

const handleWeatherImage = (code) => {
  if (code[0] == 2) {
    return <Thunder />;
  } else if (code[0] == 3) {
    return <Rain />;
  } else if (code[0] == 5) {
    return <Rain />;
  } else if (code[0] == 6) {
    return <Snow />;
  } else if (code[0] == 7) {
    return <Mist />;
  } else if (code == 800) {
    return <Sun />;
  } else return <Cloud />;
};

const listOfWeatherIcons = [
  <Thunder />,
  <Rain />,
  <Snow />,
  <Mist />,
  <Sun />,
  <Cloud />,
];

const StyledTextField = styled(TextField, {
  shouldForwardProp: (props) => props !== "focusColor",
})((p) => ({
  // input label when focused
  "& label.Mui-focused": {
    color: p.focusColor,
  },
  // focused color for input with variant='standard'
  "& .MuiInput-underline:after": {
    borderBottomColor: p.focusColor,
  },
  // focused color for input with variant='filled'
  "& .MuiFilledInput-underline:after": {
    borderBottomColor: p.focusColor,
  },
  // focused color for input with variant='outlined'
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: p.focusColor,
    },
  },
}));

function App() {
  const [query, setQuery] = useState(null);
  const [searchTermForCity, setSearchTermForCity] = useState("");

  const [citiesList, setCitiesList] = useState([]);

  const [weather, setWeather] = useState({});
  const [searchedCityName, setSearchedCityName] = useState("");

  const [locationDateTime, setLocationDateTime] = useState(null);

  const handleDropdownMenu = (citiesListResponse) => {
    const newCitiesListResponse = citiesListResponse.map((city) => {
      return {
        ...city,
        key:
          city.name + city.country + city.state + `${city.lat}` + `${city.lon}`,
        label: `${city.name}${city.state ? `, ${city.state}` : ``}, ${
          city.country
        }`,
      };
    });
    console.log(newCitiesListResponse);
    setCitiesList(newCitiesListResponse);
  };

  const getWeatherDetails = () => {
    getTimezone();
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${openWeatherapi.key}&units=metric`
      )
      .then(
        (response) => {
          setWeather(response.data);
          setQuery(null);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  const getCities = () => {
    axios
      .get(
        `http://api.openweathermap.org/geo/1.0/direct?q=${searchTermForCity}&limit=5&appid=${openWeatherapi.key}`
      )
      .then(
        (response) => {
          handleDropdownMenu(response.data);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  const getTimezone = (withName = false) => {
    axios
      .get(
        `http://api.timezonedb.com/v2.1/get-time-zone?key=${timeZoneApi.key}&format=json&by=position&lat=${query.lat}&lng=${query.lon}`
      )
      .then(
        (response) => {
          setLocationDateTime(response.data.formatted);
          setSearchedCityName(response.data.cityName);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        setQuery({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          label: "",
        });
      },
      function (error) {
        console.error("Error Code = " + error.code + " - " + error.message);
      }
    );
  };

  useEffect(() => {
    if (query) {
      getWeatherDetails();
    }
  }, [query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTermForCity) {
        getCities();
      }
    }, 700);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTermForCity]);

  return (
    <div
      className="weatherBackground"
      style={{
        background:
          weather?.main?.feels_like > 25
            ? "linear-gradient(45deg, rgba(224, 123, 76, 1.0), rgba(226, 190, 68, 1.0))"
            : "linear-gradient(45deg, rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%)",
      }}
    >
      <div className="weatherWrapper">
        <div className="searchBarRow">
          <Autocomplete
            disablePortal
            options={citiesList}
            value={query}
            onChange={(event, newValue) => {
              setQuery(newValue);
            }}
            inputValue={searchTermForCity}
            onInputChange={(event, newInputValue) => {
              setSearchTermForCity(newInputValue);
            }}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.key}>
                  {option.label}
                </li>
              );
            }}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                label="Search"
                sx={{
                  backgroundColor: "#fff",
                  margin: "16px",
                  width: "400px",
                  boxShadow: "4px 4px 8px rgba(0,0,0,0.3)",
                }}
                fullWidth
                className="locationInput"
                variant="filled"
                focusColor="#6F7378"
              />
            )}
          />
          <IconButton type="submit" sx={{ color: "#fff" }}>
            <SearchIcon />
          </IconButton>
          <IconButton onClick={getCurrentLocation}>
            <LocationOnIcon sx={{ color: "#fff" }} />
          </IconButton>
        </div>
        {weather?.name ? (
          <div className="weatherDetailsWrapper">
            <div className="dateTime">
              {moment(locationDateTime).format("dddd, DD MMMM YYYY")} | Local
              time: {moment(locationDateTime).format("hh:mm a")}
            </div>
            <div className="cityName">
              {searchedCityName}, {weather?.sys?.country}
            </div>

            <div className="weatherDesc">{weather?.weather[0]?.main}</div>
            <div className="weatherDetailsPrimary">
              <div className="weatherIcon">
                {handleWeatherImage(weather?.weather[0]?.id)}
              </div>
              <div className="temperatureMain">{weather?.main?.temp}°C</div>
              <div className="weatherPrimaryInner">
                <div className="feelsLikeTemp">
                  {`Feels: ${weather?.main?.feels_like}°C`}
                </div>
              </div>
            </div>
            <div className="weatherDetailsSecondary">
              <ArrowUpwardIcon />
              High: <span>{weather?.main?.temp_max}°C</span> |
              <ArrowDownwardIcon />
              Low: <span>{weather?.main?.temp_min}°C</span>
            </div>
          </div>
        ) : (
          <div className="noCitySelectedPrompt">
            <Carousel
              autoPlay
              infiniteLoop
              interval={3000}
              showArrows={false}
              showIndicators={false}
              showStatus={false}
              showThumbs={false}
            >
              {listOfWeatherIcons.map((icon) => {
                return (
                  <div style={{ height: "200px" }} key={icon}>
                    {icon}
                  </div>
                );
              })}
            </Carousel>
            <div>Please select a location!</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
