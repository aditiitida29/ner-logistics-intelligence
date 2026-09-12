import L from 'leaflet';

export const createIncidentIcon = (severity: string) => {
  const bgColors: Record<string, string> = {
    Critical: '#EF4444',
    High: '#F97316',
    Medium: '#F59E0B',
    Low: '#10B981'
  };
  const color = bgColors[severity] || '#EF4444';
  const pulseClass = severity === 'Critical' ? 'pulse-radar' : '';

  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div class="relative flex items-center justify-center ${pulseClass}">
        <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #FFFFFF; display: flex; items-center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
          <span style="font-size: 13px;">🚨</span>
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });
};

export const createVehicleIcon = (status: string, heading: number = 0) => {
  const bgColors: Record<string, string> = {
    Moving: '#10B981',
    Delayed: '#F59E0B',
    'At Risk': '#EF4444',
    Stopped: '#64748B',
    Delivered: '#3B82F6'
  };
  const color = bgColors[status] || '#10B981';

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid #FFFFFF; display: flex; items-center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
          <span style="font-size: 14px;">🚚</span>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -15]
  });
};

export const createDistrictIcon = (score: number) => {
  const color = score >= 80 ? '#10B981' : (score >= 65 ? '#F59E0B' : '#EF4444');
  return L.divIcon({
    className: 'custom-district-marker',
    html: `
      <div style="background-color: rgba(25, 15, 9, 0.92); border: 1.5px solid ${color}; border-radius: 6px; padding: 2px 6px; color: #F8F2EA; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${color};"></span>
        <span>${score.toFixed(0)}%</span>
      </div>
    `,
    iconSize: [46, 20],
    iconAnchor: [23, 10],
    popupAnchor: [0, -10]
  });
};

export const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div class="relative flex items-center justify-center pulse-gps">
        <div style="background-color: #3EB489; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #F8F2EA; display: flex; items-center; justify-content: center; box-shadow: 0 0 14px rgba(62, 180, 137, 0.95);">
          <div style="width: 7px; height: 7px; border-radius: 50%; background-color: #FFFFFF;"></div>
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12]
  });
};

