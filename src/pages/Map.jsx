import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../firebase";

const containerStyle = {
  width: '100%',
  height: '1000px'
};

const center = {
  lat: 39.8283,
  lng: -98.5795
};

const Map = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const markersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Markers data fetched:", markersData); // Log marker data
        setMarkers(markersData);
      } catch (error) {
        console.error("Error fetching markers:", error); // Log any errors
      }
    };

    fetchMarkers();
  }, []);

  return (
    <LoadScript googleMapsApiKey="AIzaSyAFq69d34t2H2ufrWFgwJYIjqPYZGoq03w">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={4}>
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h2>{selectedMarker.name}</h2>
              <p>Email: {selectedMarker.email}</p>
              <p>Contact: {selectedMarker.contact}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;
