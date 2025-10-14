export default function Footer() {
    return(
        <div>
            <footer className="bg-primary/5 border-t border-primary/20 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col justify-center items-center gap-4">
          <p className="text-sm font-semibold ">
            &copy; {new Date().getFullYear()} by <a href="https://github.com/Alchemyst-ai/awesome-saas/" className="text-primary-foreground">Alchemist</a>
          </p>
        <div className="max-w-6xl mx-auto px-4 py-2 font-semibold text-center text-xs text-muted-foreground">
          Made with 💙  
        </div>
        </div>

      </footer>
        </div>
    )
}