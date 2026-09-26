export const downloadCSV = (records, filename = 'attendance.csv') => {
  if (!records || records.length === 0) {
    alert("No records available to download.");
    return;
  }

  const headers = [
    'Roll Number',
    'Student Email',
    'Status',
    'Distance (meters)',
    'Selected Answer',
    'Time (HH:MM:SS)'
  ];

  const rows = records.map(record => {
    let timeStr = 'N/A';
    try {
      if (record.createdAt?.toDate) {
        timeStr = record.createdAt.toDate().toTimeString().split(' ')[0];
      } else if (record.createdAt) {
        timeStr = new Date(record.createdAt).toTimeString().split(' ')[0];
      }
    } catch (e) {
      timeStr = new Date().toTimeString().split(' ')[0];
    }

    return [
      record.rollNumber || 'N/A',
      record.studentEmail || 'N/A',
      record.status || 'VERIFIED',
      record.location?.distance ? Math.round(record.location.distance) : 'N/A',
      record.selectedAnswer || 'N/A',
      `"${timeStr}"`
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};