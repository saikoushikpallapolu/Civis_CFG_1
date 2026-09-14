import React, { useState, useEffect } from "react";
import { responseApi } from "../../api/responseApi";
import SkeletonCard from "../common/SkeletonCard";
import TooltipHover from "../common/TooltipHover";
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  FileSpreadsheet,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

export default function RawResponsesTable({ consultationId, questions = [] }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterQuestionId, setFilterQuestionId] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});

  const objectiveQuestions = questions.filter(
    (q) => q.type === "single_choice" || q.type === "multi_choice"
  );

  const selectedQuestionObj = questions.find((q) => q.questionId === filterQuestionId);
  const availableOptions = selectedQuestionObj ? selectedQuestionObj.options || [] : [];

  const fetchResponses = (targetPage = page) => {
    setLoading(true);
    setError("");

    const params = {
      page: targetPage,
      limit: 10,
    };
    if (search.trim()) params.search = search.trim();
    if (filterQuestionId && filterValue) {
      params.filterQuestionId = filterQuestionId;
      params.filterValue = filterValue;
    }

    responseApi
      .getResponses(consultationId, params)
      .then((res) => {
        const data = res.data;
        setResponses(data.responses || []);
        setTotalPages(data.totalPages || 1);
        setTotalResponses(data.totalResponses || 0);
        setPage(data.page || 1);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load raw citizen submissions");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResponses(1);
  }, [consultationId, filterQuestionId, filterValue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResponses(1);
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (responses.length === 0) return;

    // Build CSV headers
    const headers = [
      "Response ID",
      "Citizen Name",
      "Citizen Email",
      "Respondent Type",
      "Submitted At",
      ...questions.map((q) => `"${q.text.replace(/"/g, '""')}"`),
    ];

    const rows = responses.map((r) => {
      const isAnon = !r.citizenId;
      const citizenName = isAnon ? "Anonymous Citizen" : r.citizenId.name || "Verified Citizen";
      const citizenEmail = isAnon ? "N/A" : r.citizenId.email || "N/A";
      const respType = isAnon ? "Anonymous" : "Authenticated";
      const dateStr = new Date(r.submittedAt).toLocaleString();

      const answerMap = new Map();
      (r.answers || []).forEach((a) => {
        const val = Array.isArray(a.value) ? a.value.join("; ") : String(a.value || "");
        answerMap.set(a.questionId, val);
      });

      const questionCols = questions.map((q) => {
        const val = answerMap.get(q.questionId) || "";
        return `"${val.replace(/"/g, '""')}"`;
      });

      return [
        r._id,
        `"${citizenName}"`,
        `"${citizenEmail}"`,
        respType,
        `"${dateStr}"`,
        ...questionCols,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consultation-responses-${consultationId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-brown-200 shadow-xs p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-brown-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brown-100 text-brown-800 border border-brown-200">
              Audit & Drill-Down
            </span>
          </div>
          <h3 className="text-xl font-bold text-brown-950 font-serif">
            Raw Citizen Submissions Ledger
          </h3>
          <p className="text-xs text-brown-500">
            Inspect individual citizen survey answers, search commentary, and export verbatim records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={responses.length === 0}
            className="interactive-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brown-100 hover:bg-brown-200/80 border border-brown-200 text-brown-800 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-brown-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text comments or respondent..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-brown-50/70 border border-brown-200 text-brown-900 placeholder:text-brown-400 focus:outline-hidden focus:ring-1 focus:ring-brown-500 focus:bg-white transition-all"
          />
        </form>

        {objectiveQuestions.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={filterQuestionId}
              onChange={(e) => {
                setFilterQuestionId(e.target.value);
                setFilterValue("");
              }}
              className="px-3 py-2 rounded-xl text-xs bg-white border border-brown-200 text-brown-800 font-medium focus:outline-hidden"
            >
              <option value="">Filter by Question...</option>
              {objectiveQuestions.map((q, idx) => (
                <option key={q.questionId} value={q.questionId}>
                  Q{idx + 1}: {q.text.slice(0, 30)}...
                </option>
              ))}
            </select>

            {filterQuestionId && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white border border-brown-200 text-brown-800 font-medium focus:outline-hidden"
              >
                <option value="">All Choices</option>
                {availableOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-gov-red flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Table */}
      {loading ? (
        <SkeletonCard type="table" count={3} />
      ) : responses.length === 0 ? (
        <div className="p-10 text-center space-y-2 bg-brown-50/40 rounded-2xl border border-brown-200">
          <MessageSquare className="w-8 h-8 text-brown-300 mx-auto" />
          <h4 className="text-sm font-bold text-brown-900">No matching submissions found</h4>
          <p className="text-xs text-brown-500 max-w-sm mx-auto">
            {search || filterValue
              ? "Try clearing your search query or option filter to see all responses."
              : "No citizen feedback has been recorded for this consultation yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brown-50 text-brown-600 text-[11px] uppercase tracking-wider font-bold border-b border-brown-100">
              <tr>
                <th className="px-4 py-3">Respondent</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Key Choices</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-100">
              {responses.map((r) => {
                const isAnon = !r.citizenId;
                const isExpanded = Boolean(expandedRows[r._id]);
                const answerMap = new Map();
                (r.answers || []).forEach((a) => answerMap.set(a.questionId, a.value));

                return (
                  <React.Fragment key={r._id}>
                    <tr
                      onClick={() => toggleRow(r._id)}
                      className="hover:bg-brown-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                              isAnon
                                ? "bg-brown-200 text-brown-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-brown-900">
                              {isAnon ? "Anonymous Citizen" : r.citizenId.name}
                            </div>
                            <div className="text-[10px] text-brown-500">
                              {isAnon ? "Anonymous Submission" : r.citizenId.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-brown-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brown-400" />
                          <span>{new Date(r.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[10px] text-brown-400">
                          {new Date(r.submittedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {questions.slice(0, 2).map((q) => {
                            const val = answerMap.get(q.questionId);
                            if (!val) return null;
                            const displayVal = Array.isArray(val) ? val.join(", ") : String(val);
                            return (
                              <span
                                key={q.questionId}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-brown-100/90 text-brown-800 text-[10px] font-medium border border-brown-200/80 truncate max-w-[200px]"
                                title={`${q.text}: ${displayVal}`}
                              >
                                {displayVal}
                              </span>
                            );
                          })}
                          {questions.length > 2 && (
                            <span className="text-[10px] text-brown-400 self-center">
                              +{questions.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="p-1 rounded-lg hover:bg-brown-100 text-brown-500"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable answers drill-down */}
                    {isExpanded && (
                      <tr className="bg-brown-50/50">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="space-y-3 bg-white rounded-2xl p-4 border border-brown-200">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-brown-500 flex items-center justify-between">
                              <span>Full Question Responses</span>
                              <span className="font-mono text-brown-400 text-[10px]">
                                Response ID: {r._id}
                              </span>
                            </div>

                            <div className="space-y-3 pt-1">
                              {questions.map((q, qIndex) => {
                                const val = answerMap.get(q.questionId);
                                const isAnswered = val !== undefined && val !== null && val !== "";
                                const displayVal = Array.isArray(val)
                                  ? val.join(", ")
                                  : String(val || "No response provided");

                                return (
                                  <div
                                    key={q.questionId}
                                    className="p-3 rounded-xl bg-brown-50/60 border border-brown-100 space-y-1"
                                  >
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-bold text-brown-900 font-serif">
                                        Q{qIndex + 1}. {q.text}
                                      </span>
                                      <span className="text-[10px] font-semibold text-brown-400 uppercase">
                                        {q.type}
                                      </span>
                                    </div>
                                    <p
                                      className={`text-xs ${
                                        isAnswered
                                          ? "text-brown-800 font-medium"
                                          : "text-brown-400 italic"
                                      }`}
                                    >
                                      {displayVal}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-brown-100 text-xs text-brown-600">
          <span>
            Showing page <strong className="text-brown-900">{page}</strong> of{" "}
            <strong className="text-brown-900">{totalPages}</strong> ({totalResponses} total submissions)
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fetchResponses(page - 1)}
              disabled={page === 1}
              className="interactive-btn p-1.5 rounded-lg border border-brown-200 bg-white hover:bg-brown-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fetchResponses(page + 1)}
              disabled={page === totalPages}
              className="interactive-btn p-1.5 rounded-lg border border-brown-200 bg-white hover:bg-brown-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
