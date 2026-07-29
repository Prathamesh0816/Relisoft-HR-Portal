import { useState } from "react";
import * as XLSX from "xlsx";
import useStore from "../store";
import { getLeaveReport } from "../api";

export default function LeaveReports() {
    const { data } = useStore();

    const [reportType, setReportType] = useState("Monthly");
    const [month, setMonth] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [report, setReport] = useState([]);

    const handleGenerateReport = async () => {
        try {
            const year = new Date().getFullYear();
            const result = await getLeaveReport(year);

            console.log("API Result:", result);

            if (Array.isArray(result)) {
                let filtered = [...result];

                // Employee filter
                if (employeeId) {
                    const selectedEmployee = (data?.employees || []).find(
                        (employee) =>
                            String(employee.id) === String(employeeId)
                    );

                    if (selectedEmployee) {
                        filtered = filtered.filter(
                            (row) =>
                                row.employeeCode ===
                                selectedEmployee.employeeCode
                        );
                    }
                }

                // Month filter
                if (reportType === "Monthly" && month) {
                    filtered = filtered.filter((row) => {
                        const rowMonth =
                            new Date(row.fromDate).getMonth() + 1;

                        return rowMonth === Number(month);
                    });
                }

                // Start Date filter
                if (startDate) {
                    filtered = filtered.filter(
                        (row) =>
                            row.toDate?.split("T")[0] >= startDate
                    );
                }

                // End Date filter
                if (endDate) {
                    filtered = filtered.filter(
                        (row) =>
                            row.fromDate?.split("T")[0] <= endDate
                    );
                }

                // Sort by From Date, latest first
                filtered.sort(
                    (a, b) =>
                        new Date(b.fromDate) - new Date(a.fromDate)
                );

                setReport(filtered);
            } else {
                setReport([]);
            }
        } catch (error) {
            console.error(error);
            alert("Unable to generate report.");
        }
    };

    const handleExportToExcel = () => {
        if (report.length === 0) {
            alert("Please generate the report first.");
            return;
        }

        const excelData = report.map((row, index) => ({
            "Sr. No.": index + 1,
            "Employee Name": row.employeeName,
            "Employee Code": row.employeeCode,
            "Leave Type": row.leaveType,
            "From Date": row.fromDate?.split("T")[0] || "",
            "To Date": row.toDate?.split("T")[0] || "",
            "Total Days": row.totalDays,
            Status: row.status,
            "Approved By": row.approvedBy || "-",
            "Loss Of Pay": row.lossOfPay ? "Yes" : "No"
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        worksheet["!cols"] = [
            { wch: 10 },
            { wch: 25 },
            { wch: 18 },
            { wch: 24 },
            { wch: 14 },
            { wch: 14 },
            { wch: 12 },
            { wch: 14 },
            { wch: 22 },
            { wch: 14 }
        ];

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Leave Report"
        );

        XLSX.writeFile(workbook, "LeaveReport.xlsx");
    };

    const handleExportToCSV = () => {
        if (report.length === 0) {
            alert("Please generate the report first.");
            return;
        }

        const csvData = report.map((row, index) => ({
            "Sr. No.": index + 1,
            "Employee Name": row.employeeName,
            "Employee Code": row.employeeCode,
            "Leave Type": row.leaveType,
            "From Date": row.fromDate?.split("T")[0] || "",
            "To Date": row.toDate?.split("T")[0] || "",
            "Total Days": row.totalDays,
            Status: row.status,
            "Approved By": row.approvedBy || "-",
            "Loss Of Pay": row.lossOfPay ? "Yes" : "No"
        }));

        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;"
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "LeaveReport.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="card-surface p-6">
            <h2 className="text-2xl font-bold text-navy dark:text-white">
                Leave Reports
            </h2>

            <p className="text-sm text-muted dark:text-white/60 mt-2">
                Generate monthly and yearly leave reports with employee and
                date filters.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Type */}
                <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                        Report Type
                    </label>

                    <select
                        value={reportType}
                        onChange={(e) => {
                            setReportType(e.target.value);

                            if (e.target.value === "Yearly") {
                                setMonth("");
                            }
                        }}
                        className="w-full border border-navy/20 dark:border-white/20 rounded-lg p-2 bg-white dark:bg-[var(--bg-secondary)]"
                    >
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                </div>

                {/* Month */}
                {reportType === "Monthly" && (
                    <div>
                        <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                            Month
                        </label>

                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full border border-navy/20 dark:border-white/20 rounded-lg p-2 bg-white dark:bg-[var(--bg-secondary)]"
                        >
                            <option value="">All Months</option>
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                    </div>
                )}

                {/* Employee */}
                <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                        Employee
                    </label>

                    <select
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="w-full border border-navy/20 dark:border-white/20 rounded-lg p-2 bg-white dark:bg-[var(--bg-secondary)]"
                    >
                        <option value="">All Employees</option>

                        {(data?.employees || []).map((employee) => (
                            <option
                                key={employee.id}
                                value={employee.id}
                            >
                                {employee.fullName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                        Start Date
                    </label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                            setStartDate(e.target.value)
                        }
                        className="w-full border border-navy/20 dark:border-white/20 rounded-lg p-2 bg-white dark:bg-[var(--bg-secondary)]"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-semibold text-navy dark:text-white mb-2">
                        End Date
                    </label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                            setEndDate(e.target.value)
                        }
                        className="w-full border border-navy/20 dark:border-white/20 rounded-lg p-2 bg-white dark:bg-[var(--bg-secondary)]"
                    />
                </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
                <button
                    type="button"
                    onClick={handleGenerateReport}
                    className="gold-button px-6 py-3 rounded-xl font-bold text-sm"
                >
                    Generate Report
                </button>

                <button
                    type="button"
                    onClick={handleExportToExcel}
                    className="gold-button px-6 py-3 rounded-xl font-bold text-sm"
                >
                    Export to Excel
                </button>

                <button
                    type="button"
                    onClick={handleExportToCSV}
                    className="gold-button px-6 py-3 rounded-xl font-bold text-sm"
                >
                    Export to CSV
                </button>
            </div>

            {report.length > 0 && (
                <div
                    style={{
                        marginTop: "30px",
                        overflowX: "auto"
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border-color)"
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    backgroundColor: "#001428"
                                }}
                            >
                                <th style={headerStyle}>Sr. No.</th>
                                <th style={headerStyle}>Employee Name</th>
                                <th style={headerStyle}>Employee Code</th>
                                <th style={headerStyle}>Leave Type</th>
                                <th style={headerStyle}>From Date</th>
                                <th style={headerStyle}>To Date</th>
                                <th style={headerStyle}>Total Days</th>
                                <th style={headerStyle}>Status</th>
                                <th style={headerStyle}>Approved By</th>
                                <th style={headerStyle}>Leaves Remaining</th>
                                <th style={headerStyle}>Loss Of Pay</th>
                            </tr>
                        </thead>

                        <tbody>
                            {report.map((row, index) => (
                                <tr
                                    key={row.id}
                                    style={{
                                        backgroundColor:
                                            index % 2 === 0
                                                ? "var(--bg-secondary)"
                                                : "var(--bg-tertiary)"
                                    }}
                                >
                                    <td
                                        style={{
                                            ...cellStyle,
                                            textAlign: "center"
                                        }}
                                    >
                                        {index + 1}
                                    </td>

                                    <td style={cellStyle}>
                                        {row.employeeName}
                                    </td>

                                    <td style={cellStyle}>
                                        {row.employeeCode}
                                    </td>

                                    <td style={cellStyle}>
                                        {row.leaveType}
                                    </td>

                                    <td style={cellStyle}>
                                        {row.fromDate?.split("T")[0]}
                                    </td>

                                    <td style={cellStyle}>
                                        {row.toDate?.split("T")[0]}
                                    </td>

                                    <td
                                        style={{
                                            ...cellStyle,
                                            textAlign: "center"
                                        }}
                                    >
                                        {row.totalDays}
                                    </td>

                                    <td style={cellStyle}>
                                        {row.status}
                                    </td>

                                    <td style={cellStyle}>
                                        {row.approvedBy || "-"}
                                    </td>

                                    <td
                                        style={{
                                            ...cellStyle,
                                            textAlign: "center"
                                        }}
                                    >
                                        {row.remainingLeaves ?? 0}
                                    </td>

                                    <td
                                        style={{
                                            ...cellStyle,
                                            textAlign: "center"
                                        }}
                                    >
                                        {row.lossOfPay ? "Yes" : "No"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const headerStyle = {
    color: "#ffffff",
    padding: "12px",
    border: "1px solid var(--border-color)"
};

const cellStyle = {
    border: "1px solid var(--border-color)",
    padding: "10px"
};