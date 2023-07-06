import { DoctorCreationError, AppointmentUpdateError, RecordNotFoundError, GetAllError, AppoinmentCreateError, AppointmentDeleteError } from "../../../utils/customErrors"
import logger from "../../../utils/logger"
import { AppointmentReq, Appointment, AppointmentResDB } from "./model"
import { AppointmentRepository } from "./repository"
import { DoctorRepository } from "../doctores/repository"
import { Doctor } from "../doctores/model"

export interface AppointmentService {
    getAllAppointments(): Promise<Appointment[]>
    createAppointment(patientReq: AppointmentReq): Promise<Appointment>
    getAppointmentById(id: number): Promise<Appointment>
    updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment>
    deleteAppoinmentById(id: number): Promise<void>
}


export class AppointmentServiceImpl implements AppointmentService {
    private appointmentRepository: AppointmentRepository
    private doctorRepository: DoctorRepository

    constructor(appointmentRepository: AppointmentRepository, doctorRepository: DoctorRepository) {
        this.appointmentRepository = appointmentRepository
        this.doctorRepository = doctorRepository
    }
    public async updateAppointment(id: number, updates: Partial<AppointmentReq>): Promise<Appointment> {
        try {
            const existAppointment = await this.appointmentRepository.getAppointmentById(id)
            if (!existAppointment) {
                throw new RecordNotFoundError()
            }
            const updateAppointment = { ...existAppointment, ...updates }
            const appointmentUpdatedDb = await this.appointmentRepository.updateAppointment(id, updateAppointment)
            const doctor = await this.doctorRepository.getDoctorById(appointmentUpdatedDb.id_doctor)
            if (doctor) {
                const appointment: Appointment = mapAppointment(appointmentUpdatedDb, doctor)
                return appointment
            } else {
                throw new AppointmentUpdateError()
            }
        } catch (error) {
            logger.error('Failed to update appointment from service')
            throw new AppointmentUpdateError()
        }
    }

    public async getAllAppointments(): Promise<Appointment[]> {
        try {

            const patients = await this.appointmentRepository.getAllAppointment()
            console.log("LLEgamos")
            console.log(patients)
            return patients
        } catch (error) {
            logger.error(error)
            throw new GetAllError("Failed getting all appointments from service", "appointment")
        }
    }

    public async createAppointment(appointmentReq: AppointmentReq): Promise<Appointment> {
        try {
            const appointmentDb = await this.appointmentRepository.createAppointment(appointmentReq)
            const doctor = await this.doctorRepository.getDoctorById(appointmentDb.id_doctor)
            const appointment: Appointment = mapAppointment(appointmentDb, doctor)
            return appointment
        } catch (error) {
            throw new AppoinmentCreateError()
        }
    }

    public async getAppointmentById(id: number): Promise<Appointment> {
        try {
            const appointmentDb = await this.appointmentRepository.getAppointmentById(id)
            const doctor = await this.doctorRepository.getDoctorById(appointmentDb.id_doctor)
            const appointment: Appointment = mapAppointment(appointmentDb, doctor)
            return appointment
        } catch (error) {
            logger.error('Failed to get appointment from service')
            throw new RecordNotFoundError()
        }
    }

    public async deleteAppoinmentById(id: number): Promise<void> {
        try {
            const appointmentDB = await this.appointmentRepository.getAppointmentById(id)
            if (!appointmentDB) {
                throw new RecordNotFoundError()
            }
            await this.appointmentRepository.deleteAppointmentById(id)

        } catch (error) {
            logger.error('Failed to delete appointment from service')
            throw new AppointmentDeleteError()
        }
    }


}


function mapAppointment(appointmentDb: AppointmentResDB, doctor: Doctor): Appointment {
    const appointment: Appointment = {
        identificacion_paciente: appointmentDb.identificacion_paciente,
        especialidad: appointmentDb.especialidad,
        doctor: `${doctor.nombre} ${doctor.apellido}`,
        consultorio: doctor.consultorio,
        horario: appointmentDb.horario,
        id_cita: appointmentDb.id_cita,
        id_doctor: doctor.id_doctor,
        created_at: appointmentDb.created_at,
        updated_at: appointmentDb.updated_at
    }
    return appointment
}