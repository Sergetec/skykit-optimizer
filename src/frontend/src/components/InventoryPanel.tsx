import { useState } from 'react';
import type { AirportStock } from '../hooks/useGameState';
import type { Language } from '../hooks/useLanguage';
import { pickLanguage } from '../i18n/utils';

interface InventoryPanelProps {
  airports: AirportStock[];
  language: Language;
}

export function InventoryPanel({ airports, language }: InventoryPanelProps) {
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const title = pickLanguage(language, { en: 'Airport Inventory', ro: 'Inventar aeroportuar' });
  const filterLabel = pickLanguage(language, { en: 'Show only low stock', ro: 'Doar stoc critic' });
  const allHealthy = pickLanguage(language, { en: 'All airports healthy', ro: 'Toate aeroporturile sunt ok' });
  const noneLoaded = pickLanguage(language, { en: 'No airports loaded', ro: 'Nu există date pentru aeroporturi' });
  const moreAirportsLabel = (extra: number) => pickLanguage(language, {
    en: `+${extra} more airports`,
    ro: `+${extra} aeroporturi în plus`
  });

  const filteredAirports = showOnlyLowStock
    ? airports.filter(a => a.isLowStock)
    : airports;

  const displayAirports = filteredAirports.slice(0, 15);

  return (
    <div className="bg-panel rounded-[20px] border border-border p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="m-0 text-lg">{title}</h3>
        <label className="text-xs text-text-muted flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyLowStock}
            onChange={(e) => setShowOnlyLowStock(e.target.checked)}
            className="accent-accent"
          />
          {filterLabel}
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className="text-xs text-text-muted tracking-[0.15em] uppercase text-left p-3 border-b border-border/40 w-1/5">Code</th>
            <th className="text-xs text-text-muted tracking-[0.15em] uppercase text-right p-3 border-b border-border/40">F</th>
            <th className="text-xs text-text-muted tracking-[0.15em] uppercase text-right p-3 border-b border-border/40">B</th>
            <th className="text-xs text-text-muted tracking-[0.15em] uppercase text-right p-3 border-b border-border/40">PE</th>
            <th className="text-xs text-text-muted tracking-[0.15em] uppercase text-right p-3 border-b border-border/40">E</th>
          </tr>
        </thead>
        <tbody>
          {displayAirports.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-3 text-text-muted">
                {showOnlyLowStock ? allHealthy : noneLoaded}
              </td>
            </tr>
          ) : (
            displayAirports.map((airport) => (
              <tr key={airport.code} className={airport.isLowStock ? 'text-warning font-semibold' : ''}>
                <td className="p-3 border-b border-border/40 text-sm whitespace-nowrap">{airport.code}</td>
                <td className="p-3 border-b border-border/40 text-sm text-right tabular-nums">{airport.stock.first}</td>
                <td className="p-3 border-b border-border/40 text-sm text-right tabular-nums">{airport.stock.business}</td>
                <td className="p-3 border-b border-border/40 text-sm text-right tabular-nums">{airport.stock.premiumEconomy}</td>
                <td className="p-3 border-b border-border/40 text-sm text-right tabular-nums">{airport.stock.economy}</td>
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
      {filteredAirports.length > 15 && (
        <p className="text-text-muted text-sm mt-2 text-center">
          {moreAirportsLabel(filteredAirports.length - 15)}
        </p>
      )}
    </div>
  );
}

export default InventoryPanel;
