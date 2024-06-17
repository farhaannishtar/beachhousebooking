export default function SearchInput() {
    return(
        <div className="bg-typo_light-100 flex items-center h-12 rounded-xl">
            <div className="rounded-s-xl flex items-center px-4 h-full">
            <span className="material-symbols-outlined">search</span>
            </div>
            <input type="text" className="h-full flex-1 bg-typo_light-100" />
            <div className="rounded-s-xl flex items-center px-4 h-full">
            <span className="material-symbols-outlined">tune</span>
            </div>
        </div>
    )
}