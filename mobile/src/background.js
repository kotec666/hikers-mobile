async function checkLocation() {
  console.log("checking location...");

  let location;

  try {
    location = await CapacitorGeolocation.getCurrentPosition();
  } catch (err) {
    console.error(`Could not get current location: ${err}`);
    throw err;
  }

  CapacitorKV.set("cached_location", JSON.stringify(location));

  try {
    const cachedLocationsStr = CapacitorKV.get(
      "cached_locations_background"
    )?.value;

    let locationsArray = [];

    if (cachedLocationsStr) {
      try {
        locationsArray = JSON.parse(cachedLocationsStr);
        if (!Array.isArray(locationsArray)) {
          locationsArray = [];
        }
      } catch (e) {
        console.error("Failed to parse cached locations", e);
        locationsArray = [];
      }
    }

    if (location !== null) {
      locationsArray.push(location);
    }

    CapacitorKV.set(
      "cached_locations_background",
      JSON.stringify(locationsArray)
    );
  } catch (err) {
    console.error("Failed to update location history", err);
    throw err;
  }
}

const deleteUserLocations = async () => {
  try {
    CapacitorKV.set("cached_locations_background", JSON.stringify([]));
  } catch (e) {
    console.error("Error when deleting user geolocations", e);
  }
};

addEventListener("testThrowingError", async (resolve, reject, args) => {
  try {
    throw new Error("some simulated error");
  } catch (err) {
    reject(err);
  }
});

addEventListener("updateData", async (resolve, reject, args) => {
  try {
    const results = await Promise.allSettled([checkLocation()]);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    CapacitorKV.set("last_updated", currentTimestamp.toString());
    // CapacitorKV.set("update_log", JSON.stringify(updateLog));
    resolve();
  } catch (err) {
    console.error(`Could not update data: ${err}`);
    reject(err);
  }
});

addEventListener("getCurrentLocation", (resolve, reject, args) => {
  try {
    const result = CapacitorKV.get("cached_location");
    resolve(result);
  } catch (err) {
    console.error(`Could not get current location bg: ${err}`);
    reject(err);
  }
});

addEventListener("getCachedLocations", (resolve, reject, args) => {
  try {
    const result = CapacitorKV.get("cached_locations_background");
    resolve(result);
  } catch (err) {
    console.error(`Could not get current locations bg: ${err}`);
    reject(err);
  }
});

addEventListener("deleteUserLocations", async (resolve, reject, args) => {
  try {
    const results = await Promise.allSettled([deleteUserLocations()]);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const result = CapacitorKV.set("last_updated", currentTimestamp.toString());
    resolve();
  } catch (err) {
    console.error(`Could not delete data: ${err}`);
    reject(err);
  }
});

addEventListener("getLastUpdated", (resolve, reject, args) => {
  try {
    const result = CapacitorKV.get("last_updated");
    resolve(result);
  } catch (err) {
    console.error(`Could not get last updated timestamp: ${err}`);
    reject(err);
  }
});
