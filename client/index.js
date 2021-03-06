import { fetchEarthquakes } from './lib/earthquakes';
import { el, element, formatDate } from './lib/utils';
import { init, createPopup } from './lib/map';

const map = document.querySelector('.map');
init(map);

document.addEventListener('DOMContentLoaded', async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const type = urlParams.has('type') ? urlParams.get('type') : 'all';
  const period = urlParams.has('period') ? urlParams.get('period') : 'hour';

  const loading = document.querySelector('.loading');
  if (loading.classList.contains('hidden')) {
    loading.classList.remove('hidden');
  }

  const earthquakes = await fetchEarthquakes(period, type);
  const eqTitle = earthquakes.data.metadata.title;
  const eqTime = earthquakes.info.elapsed;
  const eqCacheBool = earthquakes.info.cache === true ? '' : 'ekki';
  const parent = loading.parentNode;
  parent.removeChild(loading);

  if (!earthquakes) {
    parent.appendChild(
      el('p', 'Villa við að sækja gögn'),
    );
  }

  const h1 = document.querySelector('.h1');
  const ul = document.querySelector('.earthquakes');
  const cacheAndTime = document.querySelector('.cache');

  h1.append(eqTitle);
  cacheAndTime.append(`Gögn eru ${eqCacheBool} í cache. Fyrispurn tók ${eqTime} sek`);

  earthquakes.data.features.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);
    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
});
