<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Rapport financier</title>
    <style>
        :root {
            --bg: #ffffff;
            --text: #0f172a;
            --muted: #64748b;
            --border: #e2e8f0;
            --card: #f8fafc;
            --primary: #2563eb;
            --green: #16a34a;
            --amber: #d97706;
            --red: #dc2626;
            --purple: #7c3aed;
        }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: var(--text); background: var(--bg); margin: 0; padding: 24px; }
        h1 { font-size: 18px; margin: 0; }
        h2 { font-size: 13px; margin: 18px 0 8px; }
        .muted { color: var(--muted); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; border-bottom: 2px solid var(--border); padding-bottom: 12px; margin-bottom: 12px; }
        .brand { font-weight: 700; color: var(--primary); font-size: 14px; }
        .meta { text-align: right; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 10px; }
        .k { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
        .v { font-size: 16px; font-weight: 700; margin-top: 4px; }
        .v.small { font-size: 13px; }
        .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; border: 1px solid var(--border); background: #fff; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid var(--border); padding: 7px 8px; }
        th { background: #f1f5f9; text-align: left; font-size: 11px; }
        .right { text-align: right; }
        .section { margin-top: 12px; }
        .subgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media print {
            body { padding: 0; }
            .card { break-inside: avoid; }
            table { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="brand">CoCar</div>
            <h1>Rapport financier</h1>
            <div class="muted">Synthèse entreprise</div>
        </div>
        <div class="meta">
            <div class="pill">Période : {{ $from }} → {{ $to }}</div><br>
            <div class="muted" style="margin-top:6px;">Généré le {{ $generated_at }}</div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <div class="k">Chiffre d'affaires brut</div>
            <div class="v">{{ number_format($totals['gross_revenue'] ?? 0, 0, ',', ' ') }} FCFA</div>
            <div class="muted">Total des montants payés</div>
        </div>
        <div class="card">
            <div class="k">Commission plateforme</div>
            <div class="v">{{ number_format($totals['commission_revenue'] ?? 0, 0, ',', ' ') }} FCFA</div>
            <div class="muted">(10% sur paiements libérés)</div>
        </div>
        <div class="card">
            <div class="k">Payout chauffeurs</div>
            <div class="v">{{ number_format($totals['driver_payouts'] ?? 0, 0, ',', ' ') }} FCFA</div>
            <div class="muted">Net versé</div>
        </div>
        <div class="card">
            <div class="k">Remboursements</div>
            <div class="v">{{ number_format($totals['refunds'] ?? 0, 0, ',', ' ') }} FCFA</div>
            <div class="muted">Remboursements escrow</div>
        </div>
        <div class="card">
            <div class="k">Pénalités</div>
            <div class="v">{{ number_format($totals['penalties'] ?? 0, 0, ',', ' ') }} FCFA</div>
            <div class="muted">No-show / annulation tardive</div>
        </div>
        <div class="card">
            <div class="k">Activité</div>
            <div class="v small">{{ number_format($totals['bookings'] ?? 0, 0, ',', ' ') }} réservations</div>
            <div class="v small" style="margin-top:2px;">{{ number_format($totals['payments'] ?? 0, 0, ',', ' ') }} paiements</div>
        </div>
    </div>

    @php
        $breakdowns = $breakdowns ?? [];
        $escrow = $breakdowns['escrow'] ?? [];
        $paymentStatus = $breakdowns['payment_status'] ?? [];
    @endphp

    <div class="section subgrid">
        <div class="card">
            <div class="k">Répartition escrow</div>
            <table>
                <thead>
                <tr><th>Statut</th><th class="right">Nb</th><th class="right">Montant</th></tr>
                </thead>
                <tbody>
                @foreach($escrow as $status => $row)
                    <tr>
                        <td>{{ $status }}</td>
                        <td class="right">{{ number_format($row['count'] ?? 0, 0, ',', ' ') }}</td>
                        <td class="right">{{ number_format($row['amount'] ?? 0, 0, ',', ' ') }}</td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
        <div class="card">
            <div class="k">Répartition statuts paiement</div>
            <table>
                <thead>
                <tr><th>Statut</th><th class="right">Nb</th></tr>
                </thead>
                <tbody>
                @foreach($paymentStatus as $status => $count)
                    <tr>
                        <td>{{ $status }}</td>
                        <td class="right">{{ number_format($count ?? 0, 0, ',', ' ') }}</td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>

    @php
        $top = $top ?? [];
        $topDrivers = $top['drivers'] ?? [];
        $topDeparture = $top['departure_cities'] ?? [];
        $topArrival = $top['arrival_cities'] ?? [];
        $topRoutes = $top['routes'] ?? [];
        $filters = $filters ?? [];
    @endphp

    <div class="section card">
        <div class="k">Filtres appliqués</div>
        <div class="muted" style="margin-top:6px;">
            Méthode: <strong>{{ $filters['payment_method'] ?? 'toutes' }}</strong> |
            Statut paiement: <strong>{{ $filters['status'] ?? 'tous' }}</strong> |
            Statut escrow: <strong>{{ $filters['escrow_status'] ?? 'tous' }}</strong>
        </div>
    </div>

    <div class="section subgrid">
        <div class="card">
            <div class="k">Top chauffeurs (payout net)</div>
            <table>
                <thead>
                <tr><th>Chauffeur</th><th class="right">Payout</th><th class="right">Commission</th><th class="right">Trajets</th></tr>
                </thead>
                <tbody>
                @foreach($topDrivers as $row)
                    <tr>
                        <td>{{ $row['driver_name'] }}</td>
                        <td class="right">{{ number_format($row['driver_payouts'] ?? 0, 0, ',', ' ') }}</td>
                        <td class="right">{{ number_format($row['commission'] ?? 0, 0, ',', ' ') }}</td>
                        <td class="right">{{ number_format($row['trips_count'] ?? 0, 0, ',', ' ') }}</td>
                    </tr>
                @endforeach
                @if(count($topDrivers) === 0)
                    <tr><td colspan="4" class="muted">Aucune donnée</td></tr>
                @endif
                </tbody>
            </table>
        </div>
        <div class="card">
            <div class="k">Top trajets (fréquence)</div>
            <table>
                <thead>
                <tr><th>Départ</th><th>Arrivée</th><th class="right">Réservations</th></tr>
                </thead>
                <tbody>
                @foreach($topRoutes as $row)
                    <tr>
                        <td>{{ $row['departure_city'] }}</td>
                        <td>{{ $row['arrival_city'] }}</td>
                        <td class="right">{{ number_format($row['bookings'] ?? 0, 0, ',', ' ') }}</td>
                    </tr>
                @endforeach
                @if(count($topRoutes) === 0)
                    <tr><td colspan="3" class="muted">Aucune donnée</td></tr>
                @endif
                </tbody>
            </table>
        </div>
    </div>

    <div class="section subgrid">
        <div class="card">
            <div class="k">Top villes de départ</div>
            <table>
                <thead>
                <tr><th>Ville</th><th class="right">Réservations</th></tr>
                </thead>
                <tbody>
                @foreach($topDeparture as $row)
                    <tr>
                        <td>{{ $row['city'] }}</td>
                        <td class="right">{{ number_format($row['bookings'] ?? 0, 0, ',', ' ') }}</td>
                    </tr>
                @endforeach
                @if(count($topDeparture) === 0)
                    <tr><td colspan="2" class="muted">Aucune donnée</td></tr>
                @endif
                </tbody>
            </table>
        </div>
        <div class="card">
            <div class="k">Top villes d'arrivée</div>
            <table>
                <thead>
                <tr><th>Ville</th><th class="right">Réservations</th></tr>
                </thead>
                <tbody>
                @foreach($topArrival as $row)
                    <tr>
                        <td>{{ $row['city'] }}</td>
                        <td class="right">{{ number_format($row['bookings'] ?? 0, 0, ',', ' ') }}</td>
                    </tr>
                @endforeach
                @if(count($topArrival) === 0)
                    <tr><td colspan="2" class="muted">Aucune donnée</td></tr>
                @endif
                </tbody>
            </table>
        </div>
    </div>

    <h2>Série ({{ $group }})</h2>
    <table>
        <thead>
        <tr>
            <th>Date</th>
            <th>Brut</th>
            <th>Commission</th>
            <th>Payout chauffeurs</th>
            <th>Remboursements</th>
        </tr>
        </thead>
        <tbody>
        @foreach($series as $row)
            <tr>
                <td>{{ $row['date'] }}</td>
                <td>{{ number_format($row['gross_revenue'], 0, ',', ' ') }}</td>
                <td>{{ number_format($row['commission_revenue'], 0, ',', ' ') }}</td>
                <td>{{ number_format($row['driver_payouts'], 0, ',', ' ') }}</td>
                <td>{{ number_format($row['refunds'], 0, ',', ' ') }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</body>
</html>
