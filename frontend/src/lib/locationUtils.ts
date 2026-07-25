// Looks up city/state from an Indian PIN code using India Post's free public API
export const lookupPincode = async (pincode: string) => {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
  const data = await res.json();

  if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
    const office = data[0].PostOffice[0];
    return {
      city: office.District,
      state: office.State,
    };
  }
  return null;
};

// Gets the browser's current GPS coordinates, then reverse-geocodes them into an address
export const getCurrentLocationAddress = (): Promise<{
  street: string;
  city: string;
  state: string;
  zip: string;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await res.json();
          const addr = data.address || {};

          resolve({
            street: [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", "),
            city: addr.city || addr.town || addr.village || addr.county || "",
            state: addr.state || "",
            zip: addr.postcode || "",
          });
        } catch {
          reject(new Error("Failed to fetch address from your location"));
        }
      },
      () => reject(new Error("Location access denied or unavailable")),
      { timeout: 10000 }
    );
  });
};