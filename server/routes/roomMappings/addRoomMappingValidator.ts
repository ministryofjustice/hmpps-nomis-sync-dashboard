import { validate as validateForm } from '../../validation/validation'
import { CreateRoomMappingDto } from '../../@types/mapping'

export default function validate(form: CreateRoomMappingDto): Express.ValidationError[] {
  return validateForm(
    form,
    { vsipId: 'required' },
    {
      'required.vsipId': 'Enter the VSIP room description',
    }
  )
}
