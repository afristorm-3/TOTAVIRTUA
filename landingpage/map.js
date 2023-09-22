
const apiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

function fetchUserLocation() {
            // Use the Google Geolocation API to fetch user's location based on IP address
            fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                const { location } = data;
                const userLocation = new google.maps.LatLng(location.lat, location.lng);

                // Continue with your map initialization using userLocation
                initMap(userLocation);
            })
            .catch(error => {
                console.error('Error fetching user location:', error);
            });
        }

        // Call fetchUserLocation to initiate the process
        fetchUserLocation();

        
function initMap(userLocation) {
            // Create a map centered on the user's location
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: userLocation,
                disableDefaultUI: true,
            });

            // Create an Autocomplete input for location search
            const input = document.getElementById("pac-input");
            const autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo("bounds", map);

            // Create a marker for the user's location
            const userMarker = new google.maps.Marker({
                map: map,
                title: "Your Location",
                position: userLocation,
            });

            // Create an InfoWindow for the user marker with dynamic content
            const userInfowindow = new google.maps.InfoWindow();

            // Add a mouseover event listener to the marker
            userMarker.addListener("mouseover", () => {
                // Customize the content as per your requirements
                const infoWindowContent = `
                    <div>
                        <strong>Address:</strong> Your Address Here<br>
                        <strong>Latitude:</strong> ${userLocation.lat()}<br>
                        <strong>Longitude:</strong> ${userLocation.lng()}<br>
                        <strong>Date:</strong> Current Date Here<br>
                        <strong>Time:</strong> Current Time Here
                    </div>
                `;
                userInfowindow.setContent(infoWindowContent);
                userInfowindow.open(map, userMarker);
            });

            // Add a mouseout event listener to close the InfoWindow when not hovering
            userMarker.addListener("mouseout", () => {
                userInfowindow.close();
            });

            // Create a Places Service object
            const placesService = new google.maps.places.PlacesService(map);

            // Define a request to search for nearby hospitals and emergency services
            const request = {
                location: userLocation,
                radius: 5000, // Search within a 5km radius
                types: ['hospital', 'emergency_service'],
            };

            // Perform a nearby search for hospitals and emergency services
            placesService.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Loop through the results and create markers for each place
                    for (const place of results) {
                        createMarker(place, map);
                    }
                } else {
                    console.error('Error fetching nearby places:', status);
                }
            });

            // Function to create a marker for a place
function createMarker(place, map) {
                const marker = new google.maps.Marker({
                    map: map,
                    title: place.name,
                    position: place.geometry.location,
                });

                // Add a click event listener to the marker
                marker.addListener("click", () => {
                    // Fetch directions from the user's location to the clicked place
                    const directionsService = new google.maps.DirectionsService();
                    const directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                    });

                    // Define the origin and destination for directions
                    const origin = userLocation;
                    const destination = place.geometry.location;

                    // Create a directions request
                    const request = {
                        origin: origin,
                        destination: destination,
                        travelMode: google.maps.TravelMode.DRIVING, // You can change the travel mode as needed
                    };

                    // Fetch and display the directions on the map
                    directionsService.route(request, (result, status) => {
                        if (status === google.maps.DirectionsStatus.OK) {
                            directionsRenderer.setDirections(result);
                        } else {
                            console.error("Error fetching directions:", status);
                        }
                    });
                });
            }

            // Rest of the code (radio button setup, etc.) remains the same
        }

        window.initMap = initMap;
