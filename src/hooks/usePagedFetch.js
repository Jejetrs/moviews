import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const idOf = (item) => `${item.media_type || ""}-${item.id}`;

const merge = (current, incoming) => {
  const seen = new Set(current.map(idOf));
  return [...current, ...incoming.filter((item) => !seen.has(idOf(item)))];
};

const empty = { items: [], page: 0, pages: 0, total: 0, loading: false, more: false, error: null };

const usePagedFetch = (endpoint, params, enabled = true) => {
  const [state, setState] = useState({ ...empty, loading: Boolean(enabled && endpoint) });
  const [tick, setTick] = useState(0);
  const paramsKey = JSON.stringify(params || {});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const request = useCallback((page) => axios.get(endpoint, { params: { ...params, page } }), [endpoint, paramsKey]);

  useEffect(() => {
    if (!enabled || !endpoint) {
      setState(empty);
      return undefined;
    }
    let active = true;
    setState({ ...empty, loading: true });
    request(1)
      .then((response) => {
        if (!active) return;
        setState({
          ...empty,
          items: merge([], response.data.results || []),
          page: 1,
          pages: Math.min(response.data.total_pages || 1, 500),
          total: response.data.total_results || 0,
        });
      })
      .catch((error) => {
        if (active) setState({ ...empty, error });
      });
    return () => {
      active = false;
    };
  }, [request, enabled, endpoint, tick]);

  const loadMore = () => {
    if (state.more || state.loading || state.page >= state.pages) return;
    const next = state.page + 1;
    setState((prev) => ({ ...prev, more: true }));
    request(next)
      .then((response) =>
        setState((prev) => ({
          ...prev,
          items: merge(prev.items, response.data.results || []),
          page: next,
          more: false,
        }))
      )
      .catch(() => setState((prev) => ({ ...prev, more: false })));
  };

  return {
    ...state,
    hasMore: state.page > 0 && state.page < state.pages,
    loadMore,
    reload: () => setTick((value) => value + 1),
  };
};

export default usePagedFetch;
