'use client';

import { useState } from 'react';
import { Sparkles, X, Send, Terminal, Loader2 } from 'lucide-react';
import { useSavedTrips } from '../../context/SavedTripsContext';
import { useCart } from '../../context/CartContext';
import styles from './AiPlannerModal.module.css';

const knownCities = ['Paris', 'Marseille', 'Tokyo', 'Kyoto', 'Osaka', 'London', 'Rome', 'Bali', 'New York'];

function parseUserMessage(msg) {
  const lower = msg.toLowerCase();

  // Extract cities
  const destinations = knownCities.filter(city => lower.includes(city.toLowerCase()));

  // Extract traveler count
  const travelerMatch = lower.match(/(\d+)\s*traveler/);
  const travelers = travelerMatch ? parseInt(travelerMatch[1]) : 1;

  // Extract dates
  const months = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12' };
  let startDate = null;
  let endDate = null;

  // Try "from DD month" or "DD month" patterns
  const datePattern = /(\d{1,2})\s*(january|february|march|april|may|june|july|august|september|october|november|december)/gi;
  const dateMatches = [...msg.matchAll(datePattern)];
  if (dateMatches.length > 0) {
    const day = dateMatches[0][1].padStart(2, '0');
    const month = months[dateMatches[0][2].toLowerCase()];
    startDate = `2025-${month}-${day}`;
  }

  // Try "X days" or "X-day"
  const daysMatch = lower.match(/(\d+)[- ]?days?/);
  const days = daysMatch ? parseInt(daysMatch[1]) : 10;

  if (startDate) {
    const end = new Date(startDate);
    end.setDate(end.getDate() + days);
    endDate = end.toISOString().split('T')[0];
  } else {
    startDate = '2025-10-10';
    endDate = new Date(new Date(startDate).getTime() + days * 86400000).toISOString().split('T')[0];
  }

  // Detect intent
  let intent = 'plan_trip';
  if (lower.includes('add to cart') || lower.includes('add it to cart') || lower.includes('cart')) {
    intent = 'add_to_cart';
  } else if (lower.includes('checkout') || lower.includes('pay') || lower.includes('book it')) {
    intent = 'checkout';
  }

  return { destinations, travelers, startDate, endDate, days, intent };
}

export default function AiPlannerModal({ isOpen, onClose }) {
  const { saveTrip, savedTrips } = useSavedTrips();
  const { addToCart } = useCart();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your WebMCP AI Travel Agent. Tell me your dream trip — mention the cities you want to visit, dates, and number of travelers. I can also add trips to your cart or start checkout.',
      toolsUsed: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const callTool = async (tool, params) => {
    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, params })
    });
    return (await res.json()).result;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const parsed = parseUserMessage(userMsg);

      // Handle "add to cart" intent
      if (parsed.intent === 'add_to_cart') {
        const latestTrip = savedTrips[0];
        if (latestTrip) {
          addToCart(latestTrip);
          setMessages(prev => [...prev, {
            sender: 'ai',
            toolsUsed: ['add_to_cart'],
            text: `Added "${latestTrip.name}" to your cart! Go to the Cart tab to proceed to checkout.`
          }]);
        } else {
          setMessages(prev => [...prev, {
            sender: 'ai',
            toolsUsed: [],
            text: 'No saved trip found. Plan a trip first, then I can add it to your cart.'
          }]);
        }
        setLoading(false);
        return;
      }

      // Handle "checkout" intent
      if (parsed.intent === 'checkout') {
        setMessages(prev => [...prev, {
          sender: 'ai',
          toolsUsed: [],
          text: 'Head to the Cart tab to review your items and proceed to checkout. You can also navigate directly to /checkout.'
        }]);
        setLoading(false);
        return;
      }

      // Plan trip intent
      const toolsUsed = [];

      if (parsed.destinations.length === 0) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          toolsUsed: [],
          text: `I couldn't identify any cities in your message. I know these cities: ${knownCities.join(', ')}. Please mention at least one destination.`
        }]);
        setLoading(false);
        return;
      }

      const origin = parsed.destinations[0];
      const destCities = parsed.destinations.length > 1 ? parsed.destinations.slice(1) : parsed.destinations;

      // 1. Create trip
      const trip = await callTool('create_trip', {
        name: `Trip to ${destCities.join(', ')}`,
        destinations: parsed.destinations,
        start_date: parsed.startDate,
        end_date: parsed.endDate,
        travelers: parsed.travelers
      });
      toolsUsed.push('create_trip');

      // 2. Search flights from origin
      const flights = await callTool('search_flights', { origin });
      toolsUsed.push('search_flights');

      // 3. Select best flight
      let selectedFlight = null;
      if (Array.isArray(flights) && flights.length > 0) {
        selectedFlight = flights[0];
        await callTool('select_flight', { trip_id: trip.trip_id, flight_id: selectedFlight.id });
        toolsUsed.push('select_flight');
      }

      // 4. Search hotels in first destination (not origin)
      const hotelCity = destCities[0] || origin;
      const hotels = await callTool('search_hotels', { city: hotelCity });
      toolsUsed.push('search_hotels');

      // 5. Get hotel details & select
      let selectedHotel = null;
      if (Array.isArray(hotels) && hotels.length > 0) {
        const hotelDetails = await callTool('get_hotel_details', { hotel_id: hotels[0].id });
        toolsUsed.push('get_hotel_details');
        selectedHotel = hotelDetails;
        await callTool('select_hotel', { trip_id: trip.trip_id, hotel_id: hotels[0].id });
        toolsUsed.push('select_hotel');
      }

      // 6. Weather & packing
      await callTool('get_weather_and_packing', { cities: parsed.destinations });
      toolsUsed.push('get_weather_and_packing');

      // 7. Prepare booking
      const booking = await callTool('prepare_booking', { trip_id: trip.trip_id });
      toolsUsed.push('prepare_booking');

      // 8. Save trip
      saveTrip({
        id: trip.trip_id,
        name: trip.name,
        destinations: trip.destinations,
        start_date: trip.start_date,
        end_date: trip.end_date,
        travelers: trip.travelers,
        flights: booking?.flights || [],
        hotels: booking?.hotels || [],
        cost: booking?.cost_breakdown?.total,
        booking_id: booking?.booking_id,
        created_at: new Date().toISOString()
      });
      toolsUsed.push('save_trip');

      const flightInfo = selectedFlight
        ? `${selectedFlight.originCity} → ${selectedFlight.destinationCity} (${selectedFlight.airline}, €${selectedFlight.price})`
        : 'No matching flights found in database';
      const hotelInfo = selectedHotel
        ? `${selectedHotel.name} in ${selectedHotel.city} (€${selectedHotel.pricePerNight}/night)`
        : 'No hotels found';
      const totalCost = booking?.cost_breakdown?.total || 'N/A';

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          toolsUsed,
          text: `Trip planned and saved!\n\n📍 Destinations: ${parsed.destinations.join(' → ')}\n📅 Dates: ${parsed.startDate} to ${parsed.endDate} (${parsed.days} days)\n👥 Travelers: ${parsed.travelers}\n\n✈️ Flight: ${flightInfo}\n🏨 Hotel: ${hotelInfo}\n🌤️ Weather checked — pack accordingly.\n\n💰 Total: €${totalCost}\n\n✅ Trip saved — say "add to cart" to proceed to checkout.`
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: `Sorry, something went wrong: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <Sparkles size={20} color="var(--color-accent-primary)" />
            AI Trip Planner (WebMCP Enabled)
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.chatArea}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.msg} ${msg.sender === 'user' ? styles.msgUser : styles.msgAi}`}
            >
              <div className={`${styles.avatar} ${msg.sender === 'user' ? styles.avatarUser : styles.avatarAi}`}>
                {msg.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div>
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className={styles.toolCallBadge}>
                    <Terminal size={12} />
                    WebMCP Invoked: {msg.toolsUsed.join(', ')}
                  </div>
                )}
                <div className={styles.bubble} style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.msg} ${styles.msgAi}`}>
              <div className={`${styles.avatar} ${styles.avatarAi}`}>🤖</div>
              <div className={styles.bubble} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" />
                WebMCP Agent executing tools...
              </div>
            </div>
          )}
        </div>

        <form className={styles.inputForm} onSubmit={handleSend}>
          <input
            className={styles.chatInput}
            placeholder="Type your travel request..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className={styles.sendBtn} type="submit">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
