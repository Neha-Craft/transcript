
import Pdfsummary from "@/component/pdfsummary";
import Link from "next/link";


export default function SomeFolderLayout({ children }) {
  return (
    <section>
  
      
 
        <div className="flex h-screen">
               < Pdfsummary/>
              <main className="flex-1 overflow-y-auto ">
                {children}
              </main>
            </div>
     
    </section>
     
  )
}


