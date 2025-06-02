'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

const LOGS_PER_PAGE = 25;

export default function SystemLogsViewer() {
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [lastFetchedCount, setLastFetchedCount] = useState(0);


  const fetchTotalLogCount = useCallback(async () => {
    // Fetch total count separately for more accurate pagination disabling
    // This is optional if you prefer to disable 'Next' based on lastFetchedCount < LOGS_PER_PAGE
    try {
      const { count, error } = await supabase
        .from('logs')
        .select('*', { count: 'exact', head: true });

      if (error) {
        // console.error("Error fetching total log count:", error);
        // Don't necessarily toast here, as main log fetching might still work
        setTotalLogsCount(0); // Or keep previous count?
      } else {
        setTotalLogsCount(count || 0);
      }
    } catch (e) { /* console.error("Exception fetching total log count:", e); */ setTotalLogsCount(0); }
  }, []);

  const fetchLogs = useCallback(async (pageToFetch = 1) => {
    setIsLoadingLogs(true);
    setCurrentPage(pageToFetch); // Update current page state

    const from = (pageToFetch - 1) * LOGS_PER_PAGE;
    const to = pageToFetch * LOGS_PER_PAGE - 1;

    try {
      const { data, error, count } = await supabase // 'count' here might be total if not for range
        .from('logs')
        .select('*, profiles(email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        toast.error("Failed to fetch system logs.");
        console.error("Error fetching logs:", error);
        setLogs([]);
        setLastFetchedCount(0);
      } else {
        setLogs(data || []);
        setLastFetchedCount(data?.length || 0);
        // If count from this ranged query is available and accurate for the total, use it.
        // Otherwise, rely on fetchTotalLogCount or the lastFetchedCount logic for 'Next' button.
        if (count !== null && pageToFetch === 1) { // Often, Supabase returns total count with first ranged query
             setTotalLogsCount(count);
        } else if (pageToFetch === 1) { // Fallback if count not returned reliably with range
            await fetchTotalLogCount();
        }
      }
    } catch (e) {
      toast.error("An error occurred while fetching logs.");
      console.error("Exception fetching logs:", e);
      setLogs([]);
      setLastFetchedCount(0);
    }
    setIsLoadingLogs(false);
  }, [fetchTotalLogCount]); // Added fetchTotalLogCount as dependency

  useEffect(() => {
    fetchLogs(1); // Fetch first page on mount
    // fetchTotalLogCount(); // Also fetch total count on mount, or rely on fetchLogs to set it
  }, [fetchLogs]); // fetchLogs (and its dep fetchTotalLogCount) are stable due to useCallback

  const handleNextPage = () => {
    if (currentPage * LOGS_PER_PAGE < totalLogsCount && lastFetchedCount === LOGS_PER_PAGE) {
      fetchLogs(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchLogs(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(totalLogsCount / LOGS_PER_PAGE);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">System Logs</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(1)} // Refresh button re-fetches page 1 and total count
            disabled={isLoadingLogs}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoadingLogs && currentPage === 1 ? 'Refreshing...' : 'Refresh All'}
          </button>
           <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages > 0 ? totalPages : 1} (Total: {totalLogsCount})
          </span>
        </div>
      </div>
      {isLoadingLogs && logs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No system logs found.</p>
      ) : (
        <>
          <div className="overflow-x-auto max-h-[70vh] sm:max-h-96 bg-gray-50 dark:bg-gray-800 p-2 rounded shadow"> {/* Adjusted max-h for more view */}
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 py-2">Timestamp</th>
                  <th scope="col" className="px-4 py-2">Action</th>
                  <th scope="col" className="px-4 py-2">User</th>
                  <th scope="col" className="px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">{log.profiles?.email || log.user_id?.substring(0,8) + '...' || 'System/Unknown'}</td>
                    <td className="px-4 py-2">
                      <pre className="whitespace-pre-wrap text-xs max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl overflow-x-auto bg-gray-100 dark:bg-gray-700 p-1 rounded">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoadingLogs}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={(currentPage * LOGS_PER_PAGE >= totalLogsCount && totalLogsCount > 0) || lastFetchedCount < LOGS_PER_PAGE || isLoadingLogs}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
