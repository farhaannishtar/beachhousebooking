import { useState } from "react";

interface BaseSelectProps {

    value: string | number;
    onChange?: (value: string) => void;
    placeholder?: string;
    type?: string;
    className?: string;
    name: string;
    data: Array<{
        label: string,
        value: string
    }> | []
}
const BaseSelect: React.FC<BaseSelectProps> = ({ className = '', type = 'text', value, onChange, placeholder = '', name, data }) => {
    const [popupOpened, setPopUpOpened] = useState<Boolean>(false)
    return (
        <div className={`${className} bg-typo_light-100 flex justify-between items-center h-14 rounded-lg relative`}>


            <input readOnly className={`rounded-s-lg pl-4 h-full flex-1 bg-typo_light-100 size-1 cursor-pointer`} value={value} placeholder={placeholder} type={type} name={name} onClick={() => setPopUpOpened(!popupOpened)} />
            <div className="rounded-e-lg flex items-center px-4 h-full">
                <span className="material-symbols-outlined rotate-90">chevron_right</span>
            </div>
            {/* Popup  dropdown*/}
            {popupOpened && <div className="bg-white top-16 absolute w-full  rounded-lg drop-shadow-md">
                {
                    data.map((d, i) => {
                        return <h3 key={i} onClick={() => {
                            if (onChange) {
                                onChange(d.value);
                                setPopUpOpened(!popupOpened)
                            }
                        }} className="!leading-none py-3 label px-4 first-of-type:rounded-t-lg last-of-type:rounded-b-lg hover:bg-typo_light-100 text-typo_dark-300">{d.label}</h3>
                    })
                }
            </div>}
        </div>
    )
}

export default BaseSelect;