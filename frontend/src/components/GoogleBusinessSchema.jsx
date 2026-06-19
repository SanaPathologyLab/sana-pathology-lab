import { useEffect } from 'react';

const GoogleBusinessSchema = () => {
  useEffect(() => {
    const existingScript = document.getElementById('sana-business-schema');
    if (existingScript) return;

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'sana-business-schema';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'MedicalLab', 'MedicalClinic'],
      name: 'Sana Pathology Lab',
      image: '/og-image.jpg',
      '@id': 'https://sanapathology.com',
      url: 'https://sanapathology.com',
      telephone: ['+916396786939', '+916397240575'],
      email: 'support@sanapathology.com',
      priceRange: '\u20B9\u20B9',
      description:
        'Advanced pathology lab equipped with automated analyzers and expert pathologists for precise, timely results. NABL accredited, ISO 9001:2015 certified.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Datawali Road, Near Aara Machine, Hayat Nagar',
        addressLocality: 'Sambhal',
        addressRegion: 'Uttar Pradesh',
        postalCode: '244303',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 28.5466795,
        longitude: 78.5773542,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          opens: '07:00',
          closes: '20:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '08:00',
          closes: '13:00',
        },
      ],
      areaServed: [
        { '@type': 'City', name: 'Sambhal' },
        { '@type': 'City', name: 'Chandausi' },
        { '@type': 'City', name: 'Bahjoi' },
        { '@type': 'City', name: 'Sirsi' },
        { '@type': 'City', name: 'Bilari' },
      ],
      sameAs: ['https://wa.me/916396786939'],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '125',
        bestRating: '5',
      },
      review: [
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Happy Patient' },
          reviewRating: { '@type': 'Rating', ratingValue: '5' },
          reviewBody:
            'Excellent and prompt diagnostic services with highly accurate reports.',
        },
      ],
    });

    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('sana-business-schema');
      if (el) el.remove();
    };
  }, []);

  return null;
};

export default GoogleBusinessSchema;
