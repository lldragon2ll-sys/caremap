export type Hospital = {
  id: number;
  ykiho: string;
  slug: string;
  yadm_nm: string;
  cl_cd: string | null;
  cl_cd_nm: string | null;
  sido_cd: string | null;
  sido_cd_nm: string | null;
  sggu_cd: string | null;
  sggu_cd_nm: string | null;
  emdong_nm: string | null;
  post_no: string | null;
  addr: string | null;
  tel_no: string | null;
  hosp_url: string | null;
  x_pos: number | null;
  y_pos: number | null;
  estb_dd: string | null;
  dr_tot_cnt: number;
  mdept_gdr_cnt: number;
  mdept_intn_cnt: number;
  mdept_resdnt_cnt: number;
  mdept_sdr_cnt: number;
  dety_gdr_cnt: number;
  dety_intn_cnt: number;
  dety_resdnt_cnt: number;
  dety_sdr_cnt: number;
  cmdc_gdr_cnt: number;
  cmdc_intn_cnt: number;
  cmdc_resdnt_cnt: number;
  cmdc_sdr_cnt: number;
  pnurs_cnt: number;
};

export type Category = {
  id: number;
  code: string;
  name: string;
  slug: string;
};

export type HospitalDetail = {
  hospital_id: number;
  business_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
  sunday_open: boolean | null;
  holiday_open: boolean | null;
  emergency_day: boolean | null;
  emergency_night: boolean | null;
  parking_yn: boolean | null;
  parking_qty: number | null;
  notice: string | null;
};
