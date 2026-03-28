// Adicionar estado
const [notificationsOpen, setNotificationsOpen] = useState(false);

// Usar no DropdownMenu
<DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
  {/* Badge sempre visível */}
  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-warning ...">3</span>
</DropdownMenu>