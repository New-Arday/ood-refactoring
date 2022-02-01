class Cinema {
  constructor() {
    this.films = [];
    this.screens = [];
    // names are not descriptive
  }

  //Add a new screen

  filmsonshow(screenName, capacity) {
    if (capacity > 100) {
      return "Exceeded max capacity";
    }

    //Check the screen doesn't already exist
    let screen = null;
    for (let i = 0; i < this.screens.length; i++) {
      if (this.screens[i].name === screenName) {
        screen = this.screens[i];
      }
    }

    if (screen != null) {
      return "Screen already exists";
    }

    this.screens.push({
      name: screenName,
      capacity: capacity,
      showings: [],
    });
  }

  //Add a new film
  addNewFilm(movieName, filmRating, duration) {
    //Check the film doesn't already exist
    let movie = null;
    for (let i = 0; i < this.films.length; i++) {
      if (this.films[i].name == movieName) {
        movie = this.films[i];
      }
    }

    if (movie != null) {
      return "Film already exists";
    }

    //Check the rating is valid
    if (filmRating != "U" && filmRating != "PG") {
      if (filmRating != "12" && filmRating != "15" && filmRating != "18") {
        return "Invalid rating";
      }
    }

    //Check duration
    const result = /^(\d?\d):(\d\d)$/.exec(duration);
    if (result == null) {
      return "Invalid duration";
    }
    const hour = 60;
    const hours = parseInt(result[1]);
    const mins = parseInt(result[2]);
    if (hours <= 0 || mins > hour) {
      return "Invalid duration";
    }

    this.films.push({
      name: movieName,
      rating: filmRating,
      duration: duration,
    });
  }

  //Add a showing for a specific film to a screen at the provided start time
  add(movie, screenName, startTime) {
    let result = /^(\d?\d):(\d\d)$/.exec(startTime);
    if (result == null) {
      return "Invalid start time";
    }
    const hour = 60;
    const intendedStartTimeHours = parseInt(result[1]);
    const intendedStartTimeMinutes = parseInt(result[2]);
    if (intendedStartTimeHours <= 0 || intendedStartTimeMinutes > hour) {
      return "Invalid start time";
    }

    let film = null;
    //Find the film by name
    for (let i = 0; i < this.films.length; i++) {
      if (this.films[i].name == movie) {
        film = this.films[i];
      }
    }

    if (film === null) {
      return "Invalid film";
    }

    //From duration, work out intended end time
    //if end time is over midnight, it's an error
    //Check duration
    result = /^(\d?\d):(\d\d)$/.exec(film.duration);
    if (result == null) {
      return "Invalid duration";
    }

    const durationHours = parseInt(result[1]);
    const durationMins = parseInt(result[2]);

    //Add the running time to the duration
    let intendedEndTimeHours = intendedStartTimeHours + durationHours;

    //It takes 20 minutes to clean the screen so add on 20 minutes to the duration
    //when working out the end time
    let intendedEndTimeMinutes = intendedStartTimeMinutes + durationMins + 20;
    if (intendedEndTimeMinutes >= hour) {
      intendedEndTimeHours += Math.floor(intendedEndTimeMinutes / hour);
      intendedEndTimeMinutes = intendedEndTimeMinutes % hour;
    }
    const day = 24;
    if (intendedEndTimeHours >= day) {
      return "Invalid start time - film ends after midnight";
    }

    //Find the screen by name
    let theatre = null;
    for (let i = 0; i < this.screens.length; i++) {
      if (this.screens[i].name == screenName) {
        theatre = this.screens[i];
      }
    }

    if (theatre === null) {
      return "Invalid screen";
    }

    //Go through all existing showings for this film and make
    //sure the start time does not overlap
    let error = false;
    for (let i = 0; i < theatre.showings.length; i++) {
      //Get the start time in hours and minutes
      const startTime = theatre.showings[i].startTime;
      result = /^(\d?\d):(\d\d)$/.exec(startTime);
      if (result == null) {
        return "Invalid start time";
      }

      const startTimeHours = parseInt(result[1]);
      const startTimeMins = parseInt(result[2]);
      if (startTimeHours <= 0 || startTimeMins > hour) {
        return "Invalid start time";
      }

      //Get the end time in hours and minutes
      const endTime = theatre.showings[i].endTime;
      result = /^(\d?\d):(\d\d)$/.exec(endTime);
      if (result == null) {
        return "Invalid end time";
      }

      const endTimeHours = parseInt(result[1]);
      const endTimeMins = parseInt(result[2]);
      if (endTimeHours <= 0 || endTimeMins > hour) {
        return "Invalid end time";
      }

      //if intended start time is between start and end
      const dateOne = new Date();
      dateOne.setMilliseconds(0);
      dateOne.setSeconds(0);
      dateOne.setMinutes(intendedStartTimeMinutes);
      dateOne.setHours(intendedStartTimeHours);

      const dateTwo = new Date();
      dateTwo.setMilliseconds(0);
      dateTwo.setSeconds(0);
      dateTwo.setMinutes(intendedEndTimeMinutes);
      dateTwo.setHours(intendedEndTimeHours);

      const dateThree = new Date();
      dateThree.setMilliseconds(0);
      dateThree.setSeconds(0);
      dateThree.setMinutes(startTimeMins);
      dateThree.setHours(startTimeHours);

      const dateFour = new Date();
      dateFour.setMilliseconds(0);
      dateFour.setSeconds(0);
      dateFour.setMinutes(endTimeMins);
      dateFour.setHours(endTimeHours);

      if (
        (dateOne > dateThree && dateOne < dateFour) ||
        (dateTwo > dateThree && dateTwo < dateFour) ||
        (dateOne < dateThree && dateTwo > dateFour)
      ) {
        error = true;
        break;
      }
    }

    if (error) {
      return "Time unavailable";
    }

    //Add the new start time and end time to the showing
    theatre.showings.push({
      film: film,
      startTime: startTime,
      endTime: intendedEndTimeHours + ":" + intendedEndTimeMinutes,
    });
  }

  allShowings() {
    let showings = {};
    for (let i = 0; i < this.screens.length; i++) {
      const screen = this.screens[i];
      for (let j = 0; j < screen.showings.length; j++) {
        const showing = screen.showings[j];
        if (!showings[showing.film.name]) {
          showings[showing.film.name] = [];
        }
        showings[showing.film.name].push(
          `${screen.name} ${showing.film.name} (${showing.film.rating}) ${showing.startTime} - ${showing.endTime}`
        );
      }
    }

    return showings;
  }
}

module.exports = Cinema;
