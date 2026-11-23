export * from './types'

export { farmerProfile, FarmerDashboardView } from './FarmerDashboardView'
export { farmerGroupProfile, FarmerGroupDashboardView } from './FarmerGroupDashboardView'
export { villageOfficerProfile, VillageOfficerDashboardView } from './VillageOfficerDashboardView'
export { coopManagerProfile, CoopManagerDashboardView } from './CoopManagerDashboardView'
export { homestayOperatorProfile, HomestayOperatorDashboardView } from './HomestayOperatorDashboardView'
export { fieldSurveyorProfile, FieldSurveyorDashboardView } from './FieldSurveyorDashboardView'
export { residentProfile, ResidentDashboardView } from './ResidentDashboardView'
export { smartTourismProfile, POKDARWIS_ARTICLES_OVERVIEW, SmartTourismDashboardView } from './SmartTourismDashboardView'
export { touristProfile, TouristDashboardView } from './TouristDashboardView'
export { adminProfile, AdminDashboardView } from './AdminDashboardView'

import { RoleKey, RoleDashboardProfile } from './types'
import { farmerProfile } from './FarmerDashboardView'
import { farmerGroupProfile } from './FarmerGroupDashboardView'
import { villageOfficerProfile } from './VillageOfficerDashboardView'
import { coopManagerProfile } from './CoopManagerDashboardView'
import { homestayOperatorProfile } from './HomestayOperatorDashboardView'
import { fieldSurveyorProfile } from './FieldSurveyorDashboardView'
import { residentProfile } from './ResidentDashboardView'
import { smartTourismProfile } from './SmartTourismDashboardView'
import { touristProfile } from './TouristDashboardView'
import { adminProfile } from './AdminDashboardView'

export const ROLE_PROFILES: Record<RoleKey, RoleDashboardProfile> = {
  farmer: farmerProfile,
  farmer_group_admin: farmerGroupProfile,
  village_officer: villageOfficerProfile,
  coop_manager: coopManagerProfile,
  homestay_operator: homestayOperatorProfile,
  field_surveyor: fieldSurveyorProfile,
  resident: residentProfile,
  smart_tourism_admin: smartTourismProfile,
  tourist: touristProfile,
  admin: adminProfile,
}
