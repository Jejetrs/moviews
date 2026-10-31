import axios from "axios";
import { useEffect, useState } from "react";

const useFetchDetails = (endpoint, params) => {
  const [state, setState] = useState({ data: undefined, loading: Boolean(endpoint), error: null });
  const [tick, setTick] = useState(0);
  const paramsKey = JSON.stringify(params || {});

  useEffect(() => {
    if (!endpoint) {
      setState({ data: undefined, loading: false, error: null });
      return undefined;
    }
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    axios
      .get(endpoint, { params })
      .then((response) => {
        if (active) setState({ data: response.data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: undefined, loading: false, error });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramsKey, tick]);

  return { ...state, reload: () => setTick((value) => value + 1) };
};

export default useFetchDetails;
