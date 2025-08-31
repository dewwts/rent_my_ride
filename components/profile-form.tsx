import { ProfileSchema } from "@/lib/schemas"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

type ProfileValues = z.infer<typeof ProfileSchema>

export function ProfileForm(){
    const {register, handleSubmit, formState:{errors}} = useForm<ProfileValues>({
        resolver:zodResolver(ProfileSchema)
    })
    // can see how to use on sign-up-form component to use validation
    return (
        <div></div>
    )
}