import "./DataTable.css";

interface DataTableProps {
    headers: string[];
    rows: string[][];
    className?: string;
}

/** Tabulka převzatá z dokumentace modelu, na úzké obrazovce se posouvá vodorovně. */
function DataTable({ headers, rows, className }: DataTableProps) {
    return (
        <div className={className ? `data-table ${className}` : "data-table"}>
            <table className="data-table__table">
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th className="data-table__head" key={`${header}-${index}`}>{header}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr className="data-table__row" key={`${rowIndex}-${row.join("|")}`}>
                            {row.map((cell, cellIndex) => (
                                <td className="data-table__cell" key={`${cellIndex}-${cell}`}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
