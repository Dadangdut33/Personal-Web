import { NotifyError, NotifySuccess } from "@/components/Notification/Notify";
import { UseFormReturnType } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import {
  MRT_ColumnDef,
  MRT_ColumnSizingState,
  MRT_PaginationState,
  MRT_Row,
  MRT_RowData,
  MRT_SortingState,
  MRT_TableInstance,
  MRT_Updater,
  MRT_VisibilityState,
  useMantineReactTable,
} from "mantine-react-table";
import { usePathname, useSearchParams } from "next/navigation";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";

import { fetchProfileData } from "./actions/user";
import { ProfileComplete } from "./db/types";
import { ApiReturn } from "./types";
import { formErrorToString, mapFormErrorsToMessage } from "./utils";

export function useCSRFToken() {
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    async function fetchCsrfToken() {
      const response = await fetch("/csrf-token");
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    }
    fetchCsrfToken();
  }, []);

  return csrfToken;
}

export function useRedirectMsg(sendMantineNotification = false, notificationTitle = "Informasi") {
  const csrfToken = useCSRFToken();
  const [redirectMsg, setRedirecMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRedirectMsg() {
      if (typeof window === "undefined") return;
      if (!csrfToken) return;
      const response = await fetch("/api/get-redirect-msg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csrf_token: csrfToken }),
      });
      const { success, data } = await response.json();
      if (success) {
        setRedirecMsg(data);
        if (data && data.length > 0 && sendMantineNotification) {
          notifications.clean();
          notifications.show({
            title: notificationTitle,
            message: data,
            color: "blue",
            autoClose: 6000,
          });
        }
      }
    }
    fetchRedirectMsg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csrfToken]);

  return { redirectMsg };
}

export const useBaseFormMutation = <T extends ApiReturn>({
  fn,
  setReturnState,
  cleanUp,
  forceCleanUpFn,
}: {
  fn: (data?: FormData | undefined | null) => Promise<T>;
  setReturnState?: Dispatch<SetStateAction<ApiReturn>>;
  cleanUp: (data?: T) => void;
  forceCleanUpFn?: () => void;
}) => {
  const mutation = useMutation({
    mutationFn: async (form?: UseFormReturnType<any> | undefined | null) => {
      if (form) {
        const { hasErrors, errors } = form.validate();
        if (hasErrors) {
          NotifyError("Form Tidak Valid", `${mapFormErrorsToMessage(errors)}`);
          if (setReturnState) setReturnState({ success: false, message: `${formErrorToString(errors)}` });
          return;
        }

        const data = new FormData();
        for (const key in form.values) data.append(key, form.values[key]);

        return await fn(data);
      } else {
        return await fn();
      }
    },
    onSettled(data, error, variables, context) {
      if (data) {
        if (setReturnState) setReturnState(data);
        if (data.success) {
          NotifySuccess("Berhasil", data.message!);
          cleanUp(data);
        } else {
          NotifyError("Gagal", data.message!);
        }

        if (forceCleanUpFn) forceCleanUpFn();
      }
      if (error) NotifyError("Gagal", error.message);
    },
  });

  return mutation;
};

export const useProfile = (userId: string) => {
  const [profile, setProfile] = useState<ProfileComplete | null>(null);
  const csrf_token = useCSRFToken();
  useEffect(() => {
    async function fetchProfile() {
      const res = await fetchProfileData(csrf_token, userId);
      if (res) setProfile(res);
    }

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { csrf_token, profile };
};

export const useIsRendering = () => {
  const [isRendering, setIsRendering] = useState(true);
  useEffect(() => setIsRendering(false), []);
  return isRendering;
};

export const useMantineTable = <T extends MRT_RowData>({
  tblKey,
  columns,
  data,
  enableRowActions = true,
  BottomToolbarAct,
  initialVisibility,
  renderRowActionMenuItems,
  rowSelectionRules = () => true,
}: {
  tblKey: string;
  columns: MRT_ColumnDef<T>[];
  data: T[];
  enableRowActions?: boolean;
  BottomToolbarAct?: ({ table }: { table: MRT_TableInstance<T> }) => JSX.Element;
  initialVisibility?: MRT_VisibilityState;
  renderRowActionMenuItems?: (props: {
    renderedRowIndex?: number;
    row: MRT_Row<T>;
    table: MRT_TableInstance<T>;
  }) => ReactNode;
  rowSelectionRules?: (row: MRT_Row<T>) => boolean;
}) => {
  const isRendering = useIsRendering();
  const [rowSelection, setRowSelection] = useState({});
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string | undefined>(undefined);
  const [columnSizing, setColumnSizingChange] = useLocalStorage<MRT_ColumnSizingState>({
    key: `mrt_columnSizing_table_${tblKey}`,
    defaultValue: {},
  });
  const [columnVisibility, setColumnVisibility] = useLocalStorage<MRT_VisibilityState>({
    key: `mrt_columnVisibility_table_${tblKey}`,
    defaultValue: initialVisibility ? initialVisibility : {},
  });
  const [pagination, setPagination] = useLocalStorage<MRT_PaginationState>({
    key: `mrt_pagination_table_${tblKey}`,
    defaultValue: { pageIndex: 0, pageSize: 10 },
  });
  const [sorting, setSorting] = useLocalStorage<MRT_SortingState>({
    key: `mrt_sorting_table_${tblKey}`,
    defaultValue: [{ id: "createdAt", desc: true }],
  });
  const handlePaginationChange = (updater: MRT_Updater<MRT_PaginationState>) => {
    setPagination((prevPagination) => (updater instanceof Function ? updater(prevPagination) : updater));
  };
  const handleSortingChange = (updater: MRT_Updater<MRT_SortingState>) => {
    if (isRendering) return;
    setSorting((prevSorting) => (updater instanceof Function ? updater(prevSorting) : updater));
  };

  // pagination in url
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.history.pushState(
      {},
      "",
      `${pathName}?page=${pagination.pageIndex + 1}&perpage=${pagination.pageSize}${globalFilter ? `&search=${globalFilter}` : ""}`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  // run only once
  useEffect(() => {
    const page = searchParams.get("page");
    const perpage = searchParams.get("perpage");
    const search = searchParams.get("search");
    if (page) {
      let pNum = parseInt(page);
      setPagination((prev) => ({ ...prev, pageIndex: pNum - 1 }));
    }
    if (perpage) {
      let pNum = parseInt(perpage);
      setPagination((prev) => ({ ...prev, pageSize: pNum }));
    }
    if (search) {
      setGlobalFilter(search);
      setShowGlobalFilter(true);
    }
    if (columnVisibility.length) setColumnVisibility(columnVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRowSelection({}); // reset row selection after data change (batch delete for example)
  }, [data]);

  const table = useMantineReactTable<T>({
    columns,
    data,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange: setGlobalFilter,
    onShowGlobalFilterChange: setShowGlobalFilter,
    onSortingChange: handleSortingChange,
    onColumnSizingChange: setColumnSizingChange,
    autoResetPageIndex: false,
    enableColumnResizing: true,
    enableRowActions,
    state: {
      columnVisibility,
      isLoading: isRendering,
      pagination,
      rowSelection,
      globalFilter,
      showGlobalFilter,
      sorting,
      columnSizing,
    },
    mantinePaperProps: { shadow: "0", withBorder: false },
    initialState: { density: "xs", rowSelection: {} },
    enableRowSelection: rowSelectionRules,
    renderBottomToolbarCustomActions: BottomToolbarAct,
    renderRowActionMenuItems,
  });

  return { table };
};
