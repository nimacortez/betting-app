import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const apiKey = process.env.REACT_APP_API_KEY;
const API_URL = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=us&markets=h2h&oddsFormat=american&apiKey=${apiKey}`;

const formatDate = (timestamp) => {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  };
  return new Date(timestamp).toLocaleString('en-US', options);
};

const App = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevLeagueRef = useRef(null);
  const [collapsedLeagues, setCollapsedLeagues] = useState({});
  const [expandedGames, setExpandedGames] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_URL);
        console.log('API Response:', response.data);
        setGames(response.data || []);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Error fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedGames = games.slice().sort((a, b) => a.sport_title.localeCompare(b.sport_title));

  const handleToggleCollapse = (league) => {
    setCollapsedLeagues((prevCollapsedLeagues) => ({
      ...prevCollapsedLeagues,
      [league]: !prevCollapsedLeagues[league],
    }));
  };

  const handleToggleExpand = (gameId) => {
    setExpandedGames((prevExpandedGames) => ({
      ...prevExpandedGames,
      [gameId]: !prevExpandedGames[gameId],
    }));
  };

  return (
    <div className="container">
      <h1>Sports Odds</h1>
      {loading && <p className="loading-error">Loading...</p>}
      {error && <p className="loading-error">Error: {error}</p>}
      {sortedGames.map((game) => {
        const isDifferentLeague = prevLeagueRef.current !== game.sport_title;
        const isCollapsed = collapsedLeagues[game.sport_title];
        prevLeagueRef.current = game.sport_title;

        return (
          <div key={game.id}>
            {isDifferentLeague && (
              <div className={`league-header ${isCollapsed ? 'collapsed' : ''}`}>
                <h2 onClick={() => handleToggleCollapse(game.sport_title)}>
                  {game.sport_title}
                  <span className={`arrow ${isCollapsed ? 'down' : 'left'}`}></span>
                </h2>
              </div>
            )}
            {!isCollapsed && (
              <div className="game-card">
                <div className="time">{formatDate(game.commence_time)}</div>
                <div className="teams">
                  <div className="team">{game.away_team}</div>
                  <div className="team">{game.home_team}</div>
                </div>
                <div className="bookmakers">
                  {game.bookmakers?.slice(0, 5).map((bookmaker, index) => (
                    <div key={index} className="bookmaker">
                      <img src={`/images/${bookmaker.key.toLowerCase()}.png`} alt={bookmaker.key} className="sportsbook-logo" />
                      {bookmaker.markets?.map((market) => (
                        market.key === 'h2h' && (
                          <div className="price" key={market.key}>
                            <div className="away-price">{market.outcomes[0]?.price > 0 ? `+${market.outcomes[0]?.price}` : market.outcomes[0]?.price}</div>
                            <div className="home-price">{market.outcomes[1]?.price > 0 ? `+${market.outcomes[1]?.price}` : market.outcomes[1]?.price}</div>
                          </div>
                        )
                      ))}
                    </div>
                  ))}
                  {game.bookmakers && game.bookmakers.length > 5 && (
                    <div className="expand-collapse-button">
                    <button onClick={() => handleToggleExpand(game.id)}>
                      {expandedGames[game.id] ? " " : " "}
                    </button>
                    </div>
                  )}
                  {expandedGames[game.id] && game.bookmakers?.slice(5).map((bookmaker, index) => (
                    <div key={index} className="bookmaker">
                      <img src={`/images/${bookmaker.key.toLowerCase()}.png`} alt={bookmaker.key} className="sportsbook-logo" />
                      {bookmaker.markets?.map((market) => (
                        market.key === 'h2h' && (
                          <div className="price" key={market.key}>
                            <div className="away-price">{market.outcomes[0]?.price > 0 ? `+${market.outcomes[0]?.price}` : market.outcomes[0]?.price}</div>
                            <div className="home-price">{market.outcomes[1]?.price > 0 ? `+${market.outcomes[1]?.price}` : market.outcomes[1]?.price}</div>
                          </div>
                        )
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default App;
