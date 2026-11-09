import {createClient} from '@supabase/supabase-js';
import {createUsernameAuth} from './online-auth';
export const backendUrl=import.meta.env.VITE_SUPABASE_URL||'https://iojxyqpysdqjrpdknkmx.supabase.co';
const publicKey=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_rjkcDTpOcgx5EXCDeQuQkw_Ys_gEs6J';
export const supabase=backendUrl&&publicKey?createClient(backendUrl,publicKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export const usernameAuth=createUsernameAuth({client:supabase,url:backendUrl,key:publicKey});
export async function cloudSaves(){const {data,error}=await supabase.from('trade_game_saves').select('id,payload,revision,updated_at').order('updated_at',{ascending:false});if(error)throw error;return data;}
export async function saveCloud(state,revision=0){const {data,error}=await supabase.rpc('save_trade_game',{p_id:state.id,p_payload:state,p_expected_revision:revision});if(error)throw error;return data;}
export function cloudError(error){if(error?.message?.includes('SAVE_FORBIDDEN'))return 'ตัวละครนี้ผูกกับบัญชีอื่น เลือกตัวละครของบัญชีนี้หรือสร้างตัวละครใหม่ก่อนบันทึกออนไลน์';if(error?.message?.includes('SAVE_CONFLICT'))return 'มีเซฟใหม่กว่าบนบัญชีนี้ เปิดรายการเซฟออนไลน์แล้วเลือกโหลดก่อนบันทึกอีกครั้ง';if(['42P01','PGRST202','PGRST205'].includes(error?.code))return 'ระบบเซฟออนไลน์ยังเตรียมไม่เสร็จ ความก้าวหน้ายังคงบันทึกในเครื่อง';if(error?.message?.includes('Invalid login'))return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';if(error?.message?.includes('Email not confirmed'))return 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ';return 'เชื่อมต่อเซฟออนไลน์ไม่สำเร็จ เซฟในเครื่องยังอยู่ ลองอีกครั้งได้';}
