// Core driving rules for all 50 US states.
// Values reflect commonly cited statewide baselines. Always verify current
// statutes with the official state DMV handbook before relying on them.

export type StateDrivingRules = {
  stateName: string;
  speedLimits: {
    residential: string;
    urban: string;
    highway: string;
  };
  rightOfWay: {
    fourWayStop: string;
    roundabout: string;
  };
  duiLimits: {
    adult: string;
    under21: string;
  };
  seatBeltLaws: string;
  distractedDriving: string;
};

export const STATE_DRIVING_RULES: Record<string, StateDrivingRules> = {
  Alabama: {
    stateName: "Alabama",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First vehicle to arrive proceeds first. If two arrive at the same time, the driver on the right goes first.",
      roundabout: "Yield to traffic already circulating in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants. All passengers under 15 must be properly restrained in any seat.",
    distractedDriving: "Texting while driving is banned for all drivers. Novice drivers under 18 with an intermediate license may not use any handheld device.",
  },
  Alaska: {
    stateName: "Alaska",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "The vehicle that arrives first has the right of way. Ties yield to the driver on the right.",
      roundabout: "Entering traffic must yield to vehicles already in the circle.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all seating positions. Child restraints required based on age, weight, and height.",
    distractedDriving: "Texting and reading messages while driving is prohibited for all drivers. Fines increase sharply if it contributes to a crash.",
  },
  Arizona: {
    stateName: "Arizona",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive has priority. Simultaneous arrivals yield to the driver on the right.",
      roundabout: "Yield to circulating traffic. Do not stop inside the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Secondary enforcement for adults in the front seat. Primary enforcement for occupants under 16 anywhere in the vehicle.",
    distractedDriving: "Holding or supporting a phone while driving is illegal for all drivers. Hands free voice and one touch use only.",
  },
  Arkansas: {
    stateName: "Arkansas",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First vehicle at the intersection proceeds first. When arrivals are simultaneous, yield to the vehicle on your right.",
      roundabout: "Yield to traffic already in the roundabout and to pedestrians in crosswalks.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants. All children under 15 must be properly restrained.",
    distractedDriving: "Texting is banned for all drivers. Handheld phone use is prohibited in school and work zones and for drivers under 21.",
  },
  California: {
    stateName: "California",
    speedLimits: { residential: "25 mph", urban: "35 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "The vehicle that arrives first goes first. On a tie, the driver on the right has the right of way.",
      roundabout: "Yield to traffic already in the roundabout and to pedestrians in the crosswalk before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.01%" },
    seatBeltLaws: "Primary enforcement for all occupants. Children under 2 must ride in a rear facing car seat unless they exceed size limits.",
    distractedDriving: "Handheld phone use is banned for all drivers. Drivers under 18 cannot use any phone or hands free device while driving.",
  },
  Colorado: {
    stateName: "Colorado",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Vehicles inside the roundabout have the right of way. Entering drivers must yield.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adults. Primary enforcement for children under 16 in any seat.",
    distractedDriving: "Texting is banned for all drivers. Drivers under 18 cannot use a phone at all while driving.",
  },
  Connecticut: {
    stateName: "Connecticut",
    speedLimits: { residential: "25 mph", urban: "40 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On simultaneous arrival, the driver on the right has priority.",
      roundabout: "Yield to circulating traffic before entering. Do not change lanes inside a multi lane roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "All handheld phone use is prohibited for every driver. Novice drivers cannot use any device, including hands free.",
  },
  Delaware: {
    stateName: "Delaware",
    speedLimits: { residential: "25 mph", urban: "50 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "The driver who arrives first has priority. If two arrive together, yield to the vehicle on your right.",
      roundabout: "Yield to traffic already in the roundabout and to pedestrians in the crosswalk.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants regardless of seating position.",
    distractedDriving: "Handheld phone use is banned statewide. Only hands free operation is allowed while driving.",
  },
  Florida: {
    stateName: "Florida",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First vehicle to fully stop and arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Vehicles inside the roundabout always have the right of way. Entering drivers must yield.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants and all passengers under 18 in any seat.",
    distractedDriving: "Texting while driving is a primary offense for all drivers. Handheld phone use is banned in school and work zones.",
  },
  Georgia: {
    stateName: "Georgia",
    speedLimits: { residential: "30 mph", urban: "45 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. When two arrive together, the driver on the right goes first.",
      roundabout: "Yield to traffic already circulating before entering the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all front-seat occupants and all children under 18 in any seating position.",
    distractedDriving: "Hands free law statewide. Drivers may not hold or support a phone with any part of the body while driving.",
  },
  Hawaii: {
    stateName: "Hawaii",
    speedLimits: { residential: "25 mph", urban: "35 mph", highway: "60 mph" },
    rightOfWay: {
      fourWayStop: "Vehicle arriving first proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Handheld phone use is banned for all drivers. Drivers under 18 may not use any electronic device while driving.",
  },
  Idaho: {
    stateName: "Idaho",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "80 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On ties, yield to the driver on the right.",
      roundabout: "Yield to circulating traffic and stay in your lane inside the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for occupants over 18. Primary enforcement for children under 18.",
    distractedDriving: "Handheld phone use is banned for all drivers statewide. Only hands free operation is allowed.",
  },
  Illinois: {
    stateName: "Illinois",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to stop and arrive proceeds first. Simultaneous arrivals yield to the driver on the right.",
      roundabout: "Yield to traffic in the roundabout. Do not stop inside the circulating lane.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seat.",
    distractedDriving: "Handheld phone use is prohibited for all drivers. Hands free operation is required.",
  },
  Indiana: {
    stateName: "Indiana",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First vehicle to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic. Do not change lanes inside a multi lane roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Drivers may not hold a phone or other communication device while operating a vehicle. Hands free use only.",
  },
  Iowa: {
    stateName: "Iowa",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to traffic already in the roundabout and to pedestrians in crosswalks.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants and all children under 18.",
    distractedDriving: "Handheld phone use is banned for all drivers. Novice drivers cannot use any electronic device while driving.",
  },
  Kansas: {
    stateName: "Kansas",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Simultaneous arrivals yield to the vehicle on the right.",
      roundabout: "Yield to traffic in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants. Secondary enforcement for adult back-seat occupants.",
    distractedDriving: "Texting is banned for all drivers. Novice drivers cannot use any wireless device while driving.",
  },
  Kentucky: {
    stateName: "Kentucky",
    speedLimits: { residential: "35 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On ties, yield to the driver on the right.",
      roundabout: "Yield to circulating traffic. Stay in your lane through the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seat.",
    distractedDriving: "Texting is banned for all drivers. Drivers under 18 may not use any personal communication device while driving.",
  },
  Louisiana: {
    stateName: "Louisiana",
    speedLimits: { residential: "25 mph", urban: "50 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to traffic in the roundabout before entering and to pedestrians in the crosswalk.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in all seating positions.",
    distractedDriving: "Texting is banned for all drivers. Handheld phone use is prohibited in school zones and for novice drivers.",
  },
  Maine: {
    stateName: "Maine",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Simultaneous arrivals yield to the vehicle on the right.",
      roundabout: "Yield to circulating traffic and to pedestrians in the crosswalk.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Handheld phone use and texting are banned for all drivers. Hands free operation is required.",
  },
  Maryland: {
    stateName: "Maryland",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. When arrivals are simultaneous, yield to the driver on the right.",
      roundabout: "Yield to traffic already in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seat.",
    distractedDriving: "Handheld phone use and texting are banned for all drivers. Novice drivers cannot use any wireless device.",
  },
  Massachusetts: {
    stateName: "Massachusetts",
    speedLimits: { residential: "25 mph", urban: "40 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Vehicles inside the rotary have the right of way. Entering traffic must yield.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adults. Primary enforcement for children under 13.",
    distractedDriving: "Hands free law statewide. Drivers may not hold or support a mobile device while driving.",
  },
  Michigan: {
    stateName: "Michigan",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Simultaneous arrivals yield to the driver on the right.",
      roundabout: "Yield to circulating traffic. Do not change lanes inside a multi lane roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants and passengers under 16 in any seat.",
    distractedDriving: "Handheld phone use is banned for all drivers. Only hands free operation is allowed.",
  },
  Minnesota: {
    stateName: "Minnesota",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the vehicle on the right.",
      roundabout: "Yield to traffic already in the roundabout and to pedestrians in crosswalks.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Hands free law. Drivers may not hold a phone in any way while driving.",
  },
  Mississippi: {
    stateName: "Mississippi",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On a tie, yield to the driver on the right.",
      roundabout: "Yield to traffic already circulating before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants and children in all seats.",
    distractedDriving: "Texting and social media use while driving are prohibited for all drivers.",
  },
  Missouri: {
    stateName: "Missouri",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adults in the front seat. Primary enforcement for occupants under 16.",
    distractedDriving: "Handheld phone use is banned for all drivers. Hands free operation is required statewide.",
  },
  Montana: {
    stateName: "Montana",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "80 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Simultaneous arrivals yield to the vehicle on the right.",
      roundabout: "Yield to traffic in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for all occupants in every seating position.",
    distractedDriving: "No statewide ban on handheld phone use, but many local ordinances prohibit texting while driving.",
  },
  Nebraska: {
    stateName: "Nebraska",
    speedLimits: { residential: "25 mph", urban: "50 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic and to pedestrians before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adult front-seat occupants. Primary enforcement for children under 18.",
    distractedDriving: "Texting is banned for all drivers as a secondary offense. Novice drivers cannot use any handheld device.",
  },
  Nevada: {
    stateName: "Nevada",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "80 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On ties, the vehicle on the right has the right of way.",
      roundabout: "Yield to circulating traffic before entering the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adults. Primary enforcement for occupants under 18.",
    distractedDriving: "Handheld phone use and texting are banned for all drivers statewide.",
  },
  "New Hampshire": {
    stateName: "New Hampshire",
    speedLimits: { residential: "30 mph", urban: "45 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to traffic already in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "No seat belt law for adults 18 and older. Occupants under 18 must be properly restrained.",
    distractedDriving: "Hands free law. Handheld phone use is prohibited for all drivers.",
  },
  "New Jersey": {
    stateName: "New Jersey",
    speedLimits: { residential: "25 mph", urban: "50 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On simultaneous arrival, yield to the driver on the right.",
      roundabout: "Vehicles inside the circle have the right of way. Entering traffic must yield.",
    },
    duiLimits: { adult: "0.08%", under21: "0.01%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants and passengers under 18 anywhere in the vehicle.",
    distractedDriving: "Handheld phone use and texting are banned for all drivers. Novice drivers cannot use any device.",
  },
  "New Mexico": {
    stateName: "New Mexico",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seat.",
    distractedDriving: "Texting is banned statewide for all drivers. Many cities also ban handheld phone use.",
  },
  "New York": {
    stateName: "New York",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. When two arrive together, the driver on the right has priority.",
      roundabout: "Yield to traffic already in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Handheld phone use and texting are banned for all drivers. Hands free operation is required.",
  },
  "North Carolina": {
    stateName: "North Carolina",
    speedLimits: { residential: "35 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On ties, yield to the driver on the right.",
      roundabout: "Yield to traffic already in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Texting is banned for all drivers. Novice drivers under 18 cannot use any mobile phone while driving.",
  },
  "North Dakota": {
    stateName: "North Dakota",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the vehicle on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants. Secondary enforcement in the back seat.",
    distractedDriving: "Texting is banned for all drivers. Drivers under 18 may not use a phone at all while driving.",
  },
  Ohio: {
    stateName: "Ohio",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Simultaneous arrivals yield to the driver on the right.",
      roundabout: "Yield to circulating traffic and to pedestrians in crosswalks.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adults. Primary enforcement for occupants under 15.",
    distractedDriving: "Handheld phone use is banned for all drivers as a primary offense.",
  },
  Oklahoma: {
    stateName: "Oklahoma",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "75 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants only. All children under 13 must be properly restrained.",
    distractedDriving: "Texting is banned for all drivers. Novice drivers cannot use any handheld device while driving.",
  },
  Oregon: {
    stateName: "Oregon",
    speedLimits: { residential: "25 mph", urban: "45 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On ties, yield to the vehicle on the right.",
      roundabout: "Yield to traffic already in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Handheld phone use is banned for all drivers. Only hands free voice activated use is allowed.",
  },
  Pennsylvania: {
    stateName: "Pennsylvania",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Simultaneous arrivals yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for drivers and front-seat occupants under 18. Secondary enforcement for adult passengers.",
    distractedDriving: "Texting is banned for all drivers as a primary offense.",
  },
  "Rhode Island": {
    stateName: "Rhode Island",
    speedLimits: { residential: "25 mph", urban: "40 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic and to pedestrians in the crosswalk.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Handheld phone use is banned for all drivers. Hands free operation is required.",
  },
  "South Carolina": {
    stateName: "South Carolina",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On simultaneous arrival, yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Texting is banned for all drivers. Some cities also ban handheld phone use.",
  },
  "South Dakota": {
    stateName: "South Dakota",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "80 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to traffic in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adult front-seat occupants. Primary enforcement for occupants under 18.",
    distractedDriving: "Texting is banned for all drivers as a primary offense. Novice drivers cannot use any wireless device.",
  },
  Tennessee: {
    stateName: "Tennessee",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the vehicle on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants and children under 16 in any seat.",
    distractedDriving: "Handheld phone use is banned for all drivers. Hands free operation is required.",
  },
  Texas: {
    stateName: "Texas",
    speedLimits: { residential: "30 mph", urban: "60 mph", highway: "85 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On ties, yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering the roundabout.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Texting is banned for all drivers statewide. Drivers under 18 cannot use a wireless device at all while driving.",
  },
  Utah: {
    stateName: "Utah",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "80 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Simultaneous arrivals yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering. Stay in your lane through the roundabout.",
    },
    duiLimits: { adult: "0.05%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Manual use of a phone for anything other than a call is banned for all drivers. Novice drivers cannot use a phone at all.",
  },
  Vermont: {
    stateName: "Vermont",
    speedLimits: { residential: "25 mph", urban: "50 mph", highway: "65 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic and to pedestrians in the crosswalk.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adults. Primary enforcement for occupants under 18.",
    distractedDriving: "Handheld phone use is banned for all drivers. Only hands free operation is allowed.",
  },
  Virginia: {
    stateName: "Virginia",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for adult front-seat occupants. Primary enforcement for children under 18.",
    distractedDriving: "Holding a handheld communication device while driving is banned for all drivers.",
  },
  Washington: {
    stateName: "Washington",
    speedLimits: { residential: "25 mph", urban: "60 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Handheld phone use is banned for all drivers. Any handheld electronic device use while driving is a primary offense.",
  },
  "West Virginia": {
    stateName: "West Virginia",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the driver on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Primary enforcement for front-seat occupants and children under 18 in any seating position.",
    distractedDriving: "Handheld phone use is banned for all drivers. Only hands free operation is allowed.",
  },
  Wisconsin: {
    stateName: "Wisconsin",
    speedLimits: { residential: "25 mph", urban: "55 mph", highway: "70 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. On ties, yield to the driver on the right.",
      roundabout: "Yield to traffic already in the roundabout before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.00%" },
    seatBeltLaws: "Primary enforcement for all occupants in every seating position.",
    distractedDriving: "Texting is banned for all drivers. Novice drivers cannot use any cellular device while driving.",
  },
  Wyoming: {
    stateName: "Wyoming",
    speedLimits: { residential: "30 mph", urban: "55 mph", highway: "80 mph" },
    rightOfWay: {
      fourWayStop: "First to arrive proceeds first. Ties yield to the vehicle on the right.",
      roundabout: "Yield to circulating traffic before entering.",
    },
    duiLimits: { adult: "0.08%", under21: "0.02%" },
    seatBeltLaws: "Secondary enforcement for all occupants in every seating position.",
    distractedDriving: "Texting is banned for all drivers as a primary offense.",
  },
};

/** Sorted list of every state name in the rules dataset. */
export const STATE_NAMES: string[] = Object.keys(STATE_DRIVING_RULES).sort();

/** Look up a state's rules by name. Returns undefined if not found. */
export function getStateDrivingRules(name: string | null | undefined): StateDrivingRules | undefined {
  if (!name) return undefined;
  return STATE_DRIVING_RULES[name];
}
