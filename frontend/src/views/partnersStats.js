import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactPlaceholder from 'react-placeholder';
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import { NotFound } from './notFound';
import { useFetch } from '../hooks/UseFetch';
import { Leaderboard } from '../components/partners/leaderboard';
import { Resources } from '../components/partners/partnersResources';
import { OHSOME_STATS_BASE_URL } from '../config';
import { Button } from '../components/button';
import { TwitterIcon, FacebookIcon, InstagramIcon } from '../components/svgIcons';

function getSocialIcons(link) {
  const socialName = link.split('_')?.[1];
  switch (socialName) {
    case 'x':
      return <TwitterIcon noBg className="partners-social-icon" />;
    case 'meta':
      return <FacebookIcon className="partners-social-icon" />;
    case 'instagram':
      return <InstagramIcon className="partners-social-icon" />;
    default:
      return <></>;
  }
}

const tabData = [{ id: 'leaderboard', title: 'Leaderboard' }];

export const PartnersStats = () => {
  const { id, tabname } = useParams();
  const navigate = useNavigate();
  const [partnerStats, setPartnerStats] = useState(null);
  const [error, loading, partner] = useFetch(`partners/${id}/`);

  // navigate to /leaderboard path when no tab param present
  useEffect(() => {
    if (!tabname) {
      navigate('leaderboard');
    }
  }, [navigate, tabname]);

  const fetchData = async (name) => {
    try {
      let hashtag = name.trim();
      if (hashtag.startsWith('#')) {
        hashtag = hashtag.slice(1);
      }
      hashtag = hashtag.toLowerCase();
      const response = await fetch(OHSOME_STATS_BASE_URL + '/stats/hashtags/' + hashtag);
      if (response.ok) {
        const jsonData = await response.json();
        if (jsonData.result !== undefined && Object.keys(jsonData.result).length !== 0)
          setPartnerStats(jsonData.result[hashtag]);
      } else {
        console.error('Error al obtener los datos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
    }
  };

  useEffect(() => {
    if (partner !== undefined && Object.keys(partner).length !== 0) {
      fetchData(partner.primary_hashtag);
    }
  }, [partner]);

  function getTabContent() {
    switch (tabname) {
      case 'leaderboard':
        return <Leaderboard partner={partner} partnerStats={partnerStats} />;
      default:
        return <></>;
    }
  }

  const socialLinks = Object.keys(partner)
    .filter((key) => key.startsWith('link'))
    .filter((link) => partner[link]);

  return (
    <ReactPlaceholder
      showLoadingAnimation={true}
      rows={26}
      ready={!loading}
      className="pv3 ph2 ph4-ns"
    >
      {!loading && error ? (
        <NotFound />
      ) : (
        <div className="">
          <div className="flex flex-column bg-blue-dark ph4">
            {/* logo */}
            {partner.logo_url ? (
              <div style={{ margin: '2.25rem  0 1.75rem 0' }}>
                <img src={partner.logo_url} alt="logo" height={70} />
              </div>
            ) : (
              <h3 className="f2 fw6 ttu barlow-condensed white" style={{ marginBottom: '1.75rem' }}>
                {partner.name}
              </h3>
            )}
            <div className="flex justify-between">
              <div className="flex gap-0.75">
                {tabData.map(({ id: tabId, title }) => (
                  <div
                    key={tabId}
                    className={`flex items-center pointer partners-tab-item ${
                      tabname === tabId ? 'bg-tan blue-dark' : 'bg-grey-dark white'
                    }`}
                    onClick={() => navigate(`/partners/${id}/stats/${tabId}`)}
                  >
                    <p className="ma0">{title}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                {/* new to mapping button */}
                <Link to={`/learn/map/`}>
                  <Button
                    className="bg-transparent white br1 f5 fw5 bn"
                    style={{ padding: '0.75rem 0' }}
                  >
                    <FormattedMessage {...messages.newToMapping} />
                  </Button>
                </Link>

                {/* resources button */}
                <Resources partner={partner} />

                {/* social logos */}
                {!!socialLinks.length && (
                  <div className="flex items-center gap-0.625">
                    {socialLinks.map((link) => (
                      <a
                        href={partner[link]}
                        className="link barlow-condensed white f4 ttu di-l dib"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {getSocialIcons(link)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* tab content */}
          {getTabContent()}
        </div>
      )}
    </ReactPlaceholder>
  );
};
