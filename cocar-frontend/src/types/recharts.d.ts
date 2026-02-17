declare module 'recharts' {
  // Déclaration minimale pour éviter les erreurs TS7016 dans ce projet.
  // Recharts expose de nombreux composants; on les tape en `any` ici.
  export const ResponsiveContainer: any
  export const AreaChart: any
  export const Area: any
  export const XAxis: any
  export const YAxis: any
  export const Tooltip: any
  export const CartesianGrid: any
  export const BarChart: any
  export const Bar: any
  export const LineChart: any
  export const Line: any
  export const PieChart: any
  export const Pie: any
  export const Legend: any
}
