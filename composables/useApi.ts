import { useState } from "react";
import axios from "../plugins/axios"; // Your axios instance
import { Data } from "../types/types";

export const useApi = <T>(endpoint: string) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [item, setItem] = useState<T | undefined>();
  const [options, setOptions] = useState([]);
  // const { downloadFile } = useUpload();

  const [pagination, setPagination] = useState<
    Data & {
      sortBy?: { key: string; order: string }[];
      page?: number;
      itemsPerPage?: number;
      search?: string;
      relations?: string;
    }
  >({
    current_page: 0,
    from: 0,
    last_page: 0,
    per_page: 0,
    to: 0,
    total: 0,
  });

  const assignPagination = (data: Data) => {
    setPagination((prev) => ({
      ...prev,
      current_page: data.current_page,
      from: data.from,
      last_page: data.last_page,
      per_page: data.per_page,
      to: data.to,
      total: data.total,
    }));
  };

  async function index(options?: any) {
    setLoading(true);

    try {
      setPagination((prev) => ({ ...prev, ...options }));

      const currentPagination = { ...pagination, ...options };

      const params = {
        // page: currentPagination.page,
        // limit: currentPagination.itemsPerPage,
        // relations: currentPagination.relations,
        // ...options,
      };

      const res = await axios.get(endpoint, { params });

      if (options?.all) {
        setItems(res.data.data);
      } else {
        setItems(res.data.data.data);
        assignPagination(res.data.data);
      }

      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function store(payload: any) {
    setLoadingActions(true);

    try {
      const res = await axios.post(endpoint, payload);
      return res;
    } catch (error) {
      throw error;
    } finally {
      await index();
      setLoadingActions(false);
    }
  }

  async function show(id: any) {
    setLoading(true);

    try {
      const res = await axios.get(`${endpoint}/${id}`);
      setItems(res.data.data);
      return res.data.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function update(id: any, payload: any) {
    setLoadingActions(true);

    try {
      const res = await axios.put(`${endpoint}/${id}`, payload);
      return res;
    } catch (error) {
      throw error;
    } finally {
      await index();
      setLoadingActions(false);
    }
  }

  async function destroy(id: number) {
    setLoadingActions(true);

    try {
      const res = await axios.delete(`${endpoint}/${id}`);
      return res;
    } catch (error) {
      throw error;
    } finally {
      await index();
      setLoadingActions(false);
    }
  }

  // async function download(payload: any) {
  //   const res = await axios.get(`${endpoint}/export`, {
  //     params: { ...payload },
  //     responseType: "arraybuffer",
  //   });

  //   downloadFile(res.data, payload.filename);
  // }

  async function getOptions() {
    setLoading(true);

    try {
      const payload = { all: 1 };
      const res = await axios.get(endpoint, { params: payload });
      setOptions(res.data.data);
      return res.data.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    endpoint,
    item,
    items,
    loading,
    loadingActions,
    options,
    pagination,
    setItem,
    setItems,
    setPagination,
    index,
    store,
    show,
    update,
    destroy,
    // download,
    getOptions,
  };
};
