/** DTO จาก .NET API — GET /master/roles */
export type MasterRoleApiDto = {
  id: string
  code: string
  name: string
  description: string | null
  statusId: number
  created?: string
  createdBy?: string | null
  modifiedAt?: string
  modifiedBy?: string | null
}

/** DTO จาก .NET API — GET /master/titles */
export type MasterTitleApiDto = {
  id: string
  name: string
  description: string | null
  statusId: number
  created?: string
  createdBy?: string | null
  modified?: string
  modifiedBy?: string | null
}

/** GET /master/semesters */
export type MasterSemesterApiDto = {
  id: string
  academicYear: string
  term: string
  startDate: string
  endDate: string
  isCurrent: boolean
  statusId: number
  created?: string
  createdBy?: string | null
  modified?: string | null
  modifiedBy?: string | null
}

/** GET /master/classes */
export type MasterClassApiDto = {
  id: string
  name: string
  level: string
  statusId: number
  created?: string
  createdBy?: string | null
  modified?: string | null
  modifiedBy?: string | null
}

/** GET /master/periods */
export type MasterPeriodApiDto = {
  id: number | string
  periodNumber: number
  startTime: string
  endTime: string
  periodType: string
  statusId: number
  created?: string
  createdBy?: string | null
  modified?: string | null
  modifiedBy?: string | null
}

/** GET /master/system-statuses */
export type MasterSystemStatusApiDto = {
  id: number | string
  name: string
  description: string | null
  created?: string
  createdBy?: string | null
  modified?: string | null
  modifiedBy?: string | null
}

/** GET /master/menus */
export type MasterMenuApiDto = {
  id: string
  code: string
  label: string
  parentCode: string | null
  path: string
  type: string
  description: string | null
  statusId: number
  created?: string
  createdBy?: string | null
  modified?: string | null
  modifiedBy?: string | null
}
