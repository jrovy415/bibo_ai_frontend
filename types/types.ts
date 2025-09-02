export type Data = {
  current_page: number;
  data?: Object;
  first_page_url?: string;
  from: number;
  last_page: number;
  last_page_url?: string;
  links?: Object;
  next_page_url?: string;
  path?: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
};

type BaseColumnConfig = {
  title: string;
  key: string;
  selectKey?: string;
  sortable?: boolean;
  align?: "start" | "end" | "center";
  inputField?: "text" | "radio" | "select" | "checkbox" | "date" | "none";
  inputOptions?: Array<any>;
  nullable?: boolean;
};

type TextLikeColumn = BaseColumnConfig & {
  inputField?: "text" | "checkbox" | "date" | "none";
  inputOptions?: never;
};

type OptionsColumn = BaseColumnConfig & {
  inputField: "radio" | "select";
  inputOptions: Array<{ label: string; value: string }>;
};

export type ColumnConfig = TextLikeColumn | OptionsColumn;

export type User = {
  id: string;
  role_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  initials?: string;
  email: string;
  gender: string;
  birthday: string;
  role?: RoleWithPermissions;
};

export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

export type Role = {
  name: string;
  description: string;
};

export type Permission = {
  id: string;
  model: string;
  name: string;
  slug: string;
};
